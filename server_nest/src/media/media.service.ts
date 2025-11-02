import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { spawn } from 'child_process';
import { join, parse, dirname } from 'path';
import { promises as fs } from 'fs';
import ffmpegPath from 'ffmpeg-static';

import { Media } from './media.entity';
import { Exercise } from 'src/articles/entities/exercise.entity';
import { ExerciseItem } from 'src/articles/entities/exercise-item.entity';
import { CreateExerciseDto } from 'src/articles/dto/create-exercise.dto';

import { RatingsService } from 'src/ratings/ratings.service';
import { TargetType } from 'src/common/enums/target-type.enum';
import { makeAbsoluteUrl } from 'src/utils/media-url.util';
import { UpdateMediaDto } from './dto/update-media.dto';

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(Media)
    private readonly mediaRepository: Repository<Media>,

    @InjectRepository(Exercise)
    private readonly exerciseRepository: Repository<Exercise>,

    private readonly ratingsService: RatingsService,
  ) {}

  /* =========================================
   * SELECTS
   * ========================================= */

  async findAll(): Promise<Media[]> {
    console.log('🔥 findAll() CALLED');
    const list = await this.mediaRepository
      .createQueryBuilder('media')
      .leftJoinAndSelect('media.dialect', 'dialect')
      .leftJoinAndSelect('media.topics', 'topics')
      .where('media.dialectId IS NOT NULL') // ←←← ДОБАВЬТЕ ЭТУ СТРОКУ
      .orderBy('media.createdAt', 'DESC')
      .getMany();

    console.log('📌 RESULT COUNT =', list.length);
    return list.map((m) => this.normalizeMediaPaths(m));
  }

  async findOne(id: number): Promise<Media> {
    const media = await this.mediaRepository.findOne({
      where: { id },
      relations: ['dialect', 'topics', 'exercises', 'exercises.items'],
    });
    if (!media) throw new NotFoundException(`Медиа с ID ${id} не найдено`);
    return this.normalizeMediaPaths(media);
  }

  async findAllWithFilters(filters: {
    name?: string;
    region?: string;
    topics?: number[];
  }): Promise<Media[]> {
    const qb = this.mediaRepository
      .createQueryBuilder('media')
      .leftJoinAndSelect('media.dialect', 'dialect')
      .leftJoinAndSelect('media.topics', 'topics')
      .where('media.dialectId IS NOT NULL')
      .orderBy('media.createdAt', 'DESC');

    if (filters.name) {
      qb.andWhere('LOWER(media.title) LIKE LOWER(:name)', {
        name: `%${filters.name}%`,
      });
    }

    if (filters.region) {
      qb.andWhere('LOWER(dialect.region) LIKE LOWER(:region)', {
        region: `%${filters.region}%`,
      });
    }

    const topics = filters.topics ?? [];
    if (topics.length > 0) {
      qb.andWhere((sub) => {
        const sq = sub
          .subQuery()
          .select('mt.media_id')
          .from('media_topics', 'mt')
          .where('mt.topic_id IN (:...topics)', { topics })
          .groupBy('mt.media_id')
          .having('COUNT(DISTINCT mt.topic_id) = :cnt', {
            cnt: topics.length,
          })
          .getQuery();
        return `media.id IN ${sq}`;
      });
    }

    const list = await qb.getMany();
    return list.map((m) => this.normalizeMediaPaths(m));
  }

  async findOneWithRating(id: number, userId?: string) {
    const media = await this.mediaRepository.findOne({
      where: { id },
      relations: ['dialect', 'topics', 'exercises', 'exercises.items'],
    });
    if (!media) throw new NotFoundException(`Медиа с ID ${id} не найдено`);

    const [avg, allRatings] = await Promise.all([
      this.ratingsService.getAverage(TargetType.MEDIA, id),
      this.ratingsService.findByTarget(TargetType.MEDIA, id),
    ]);

    const userRating =
      userId !== undefined
        ? (allRatings.find((r) => r.user_id === userId || r.user?.id === userId)
            ?.value ?? null)
        : null;

    return {
      ...this.normalizeMediaPaths(media),
      averageRating: avg.average ?? 0,
      votes: avg.votes ?? 0,
      userRating,
    };
  }

  /* =========================================
   * CREATE / UPDATE / DELETE
   * ========================================= */

  async create(data: Partial<Media>): Promise<Media> {
    const entity = this.mediaRepository.create(data);
    let saved = await this.mediaRepository.save(entity);

    if (saved.type === 'video' && saved.mediaUrl) {
      try {
        const preview = await this.generatePreview(saved.mediaUrl);
        saved.previewUrl = preview;
        saved = await this.mediaRepository.save(saved);
      } catch (e) {
        console.error('[preview:create] FFmpeg error:', e);
      }
    }

    return this.normalizeMediaPaths(saved);
  }

  async update(id: number, dto: UpdateMediaDto): Promise<Media> {
    const media = await this.mediaRepository.findOne({
      where: { id },
      relations: ['topics', 'dialect'],
    });
    if (!media) throw new NotFoundException(`Медиа с ID ${id} не найдено`);

    const prevMediaUrl = media.mediaUrl;

    // simple fields
    if (dto.title !== undefined) media.title = dto.title;
    if (dto.mediaUrl !== undefined) media.mediaUrl = dto.mediaUrl;
    if (dto.previewUrl !== undefined) media.previewUrl = dto.previewUrl;
    if (dto.subtitlesLink !== undefined)
      media.subtitlesLink = dto.subtitlesLink;

    if (dto.type !== undefined) media.type = dto.type;

    if (dto.licenseType !== undefined) media.licenseType = dto.licenseType;
    if (dto.licenseAuthor !== undefined)
      media.licenseAuthor = dto.licenseAuthor;

    if (dto.level !== undefined) media.level = dto.level as any;

    if (dto.dialogueGroupId !== undefined)
      media.dialogueGroupId = dto.dialogueGroupId;

    if (dto.duration !== undefined) media.duration = dto.duration ?? undefined;
    if (dto.speaker !== undefined) media.speaker = dto.speaker ?? undefined;
    if (dto.sourceRole !== undefined)
      media.sourceRole = dto.sourceRole ?? undefined;

    if (dto.grammarLink !== undefined)
      media.grammarLink = dto.grammarLink ?? undefined;
    if (dto.resources !== undefined)
      media.resources = dto.resources ?? undefined;

    if (dto.dialectId !== undefined) {
      media.dialectId = dto.dialectId || null;
      media.dialect = dto.dialectId ? ({ id: dto.dialectId } as any) : null;
    }

    if (dto.topicIds !== undefined) {
      const normalized = (dto.topicIds ?? [])
        .map((v) => Number(v))
        .filter((v) => !Number.isNaN(v));
      await this.syncMediaTopics(media.id, normalized);
    }

    let saved = await this.mediaRepository.save(media);

    if (
      saved.type === 'video' &&
      saved.mediaUrl &&
      prevMediaUrl !== saved.mediaUrl
    ) {
      try {
        const preview = await this.generatePreview(saved.mediaUrl);
        saved.previewUrl = preview;
        saved = await this.mediaRepository.save(saved);
      } catch (e) {
        console.error('[preview:update] FFmpeg error:', e);
      }
    }

    return this.normalizeMediaPaths(saved);
  }

  async remove(id: number): Promise<void> {
    const media = await this.mediaRepository.findOne({ where: { id } });
    if (!media) throw new NotFoundException(`Медиа с ID ${id} не найдено`);
    await this.mediaRepository.remove(media);
  }

  /* =========================================
   * EXERCISES
   * ========================================= */

  async findExercisesByMedia(mediaId: number): Promise<Exercise[]> {
    return this.exerciseRepository.find({
      where: { media: { id: mediaId } },
      relations: ['items'],
      order: { id: 'ASC' },
    });
  }

  async addExerciseToMedia(mediaId: number, dto: CreateExerciseDto) {
    const media = await this.mediaRepository.findOne({
      where: { id: mediaId },
    });
    if (!media) throw new NotFoundException(`Медиа с ID ${mediaId} не найдено`);

    if (dto.items) {
      dto.items = dto.items.filter(
        (v, i, arr) =>
          i === arr.findIndex((t) => t.questionRu === v.questionRu),
      );
    }

    const exercise: DeepPartial<Exercise> = {
      type: dto.type,
      instructionRu: dto.instructionRu,
      instructionAr: dto.instructionAr,
      media,
      distractorPoolId: dto.distractorPoolId,
      items: (dto.items ?? []).map((item, i) => {
        const e = new ExerciseItem();
        e.position = i + 1;
        e.questionRu = item.questionRu ?? undefined;
        e.questionAr = item.questionAr ?? undefined;
        e.partBefore = item.partBefore ?? undefined;
        e.partAfter = item.partAfter ?? undefined;
        e.correctAnswer = item.correctAnswer ?? undefined;
        e.wordRu = item.wordRu ?? undefined;
        e.wordAr = item.wordAr ?? undefined;
        e.distractors = item.distractors ?? [];
        return e;
      }) as any,
    };

    return this.exerciseRepository.save(
      this.exerciseRepository.create(exercise),
    );
  }

  /* =========================================
   * HELPERS
   * ========================================= */

  private normalizeMediaPaths(media: Media): Media {
    media.mediaUrl = makeAbsoluteUrl(media.mediaUrl);
    media.subtitlesLink = makeAbsoluteUrl(media.subtitlesLink);
    if (media.previewUrl) media.previewUrl = makeAbsoluteUrl(media.previewUrl);
    return media;
  }

  async generatePreview(mediaUrl: string): Promise<string> {
    try {
      const uploadsRoot = join(process.cwd(), 'uploads');
      const videoPath = mediaUrl.includes(uploadsRoot)
        ? mediaUrl
        : join(uploadsRoot, mediaUrl.replace(/^\/?uploads[\\/]/, ''));

      const { name } = parse(videoPath);
      const outDir = join(dirname(videoPath), '..', 'thumbnails');
      await fs.mkdir(outDir, { recursive: true });

      const outputPath = join(outDir, `${name}-preview.jpg`);
      await fs.access(videoPath);

      await new Promise<void>((resolve, reject) => {
        const ff = spawn(ffmpegPath as string, [
          '-i',
          videoPath,
          '-ss',
          '00:00:01',
          '-vframes',
          '1',
          '-q:v',
          '2',
          outputPath,
        ]);

        ff.on('close', (code) =>
          code === 0
            ? resolve()
            : reject(
                new InternalServerErrorException(
                  `FFmpeg exited with code ${code}`,
                ),
              ),
        );

        ff.on('error', (err) =>
          reject(
            new InternalServerErrorException(`FFmpeg spawn error: ${err}`),
          ),
        );
      });

      return outputPath.replace(uploadsRoot, '/uploads').replace(/\\/g, '/');
    } catch (e) {
      console.error('[ffmpeg] preview error:', e);
      throw e;
    }
  }

  private async syncMediaTopics(mediaId: number, nextTopicIds: number[]) {
    const manager = this.mediaRepository.manager;

    const rows = await manager
      .createQueryBuilder()
      .select('mt.topic_id', 'topic_id')
      .from('media_topics', 'mt')
      .where('mt.media_id = :mediaId', { mediaId })
      .getRawMany<{ topic_id: number }>();

    const current = new Set(rows.map((r) => Number(r.topic_id)));
    const wanted = new Set(nextTopicIds);

    const toAdd: number[] = [];
    const toDel: number[] = [];

    wanted.forEach((id) => {
      if (!current.has(id)) toAdd.push(id);
    });
    current.forEach((id) => {
      if (!wanted.has(id)) toDel.push(id);
    });

    if (toDel.length) {
      await manager
        .createQueryBuilder()
        .delete()
        .from('media_topics')
        .where('media_id = :mediaId AND topic_id IN (:...ids)', {
          mediaId,
          ids: toDel,
        })
        .execute();
    }

    if (toAdd.length) {
      const values = toAdd.map((topic_id) => ({ media_id: mediaId, topic_id }));
      await manager
        .createQueryBuilder()
        .insert()
        .into('media_topics')
        .values(values as any)
        .execute();
    }
  }
}
