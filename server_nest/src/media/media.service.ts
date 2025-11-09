import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { spawn } from 'child_process';
import ffmpegPath from 'ffmpeg-static';
import { promises as fs } from 'fs';
import { dirname, join, parse } from 'path';
import { DeepPartial, Repository } from 'typeorm';

import { CreateExerciseDto } from 'src/articles/dto/create-exercise.dto';
import { ExerciseItem } from 'src/articles/entities/exercise-item.entity';
import { Exercise } from 'src/articles/entities/exercise.entity';
import { Media } from './media.entity';

import { TargetType } from 'src/common/enums/target-type.enum';
import { RatingsService } from 'src/ratings/ratings.service';
import { makeAbsoluteUrl } from 'src/utils/media-url.util';
import { UpdateMediaRequestDto } from './dto/update-media.request.dto';

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(Media)
    private readonly mediaRepository: Repository<Media>,

    @InjectRepository(Exercise)
    private readonly exerciseRepository: Repository<Exercise>,

    private readonly ratingsService: RatingsService,
  ) {}

  async findAll(): Promise<Media[]> {
    try {
      const list = await this.mediaRepository
        .createQueryBuilder('media')
        .leftJoinAndSelect('media.dialect', 'dialect')
        .leftJoinAndSelect('media.topics', 'topics')
        .where('media.dialectId IS NOT NULL')
        .orderBy('media.createdAt', 'DESC')
        .getMany();

      return list.map((m) => this.normalizeMediaPaths(m));
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Ошибка при получении списка медиа',
      );
    }
  }

  async findOne(id: number): Promise<Media> {
    if (!id || id <= 0) {
      throw new BadRequestException(
        'ID медиа должен быть положительным числом',
      );
    }

    try {
      const media = await this.mediaRepository.findOne({
        where: { id },
        relations: ['dialect', 'topics'],
      });
      if (!media) throw new NotFoundException(`Медиа с ID ${id} не найдено`);
      return this.normalizeMediaPaths(media);
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Ошибка при поиске медиа');
    }
  }

  async findAllWithFilters(filters: {
    name?: string;
    region?: string;
    topics?: number[];
  }): Promise<Media[]> {
    try {
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
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Ошибка при фильтрации медиа');
    }
  }

  async findOneWithRating(id: number, userId?: string) {
    if (!id || id <= 0) {
      throw new BadRequestException(
        'ID медиа должен быть положительным числом',
      );
    }

    if (userId && typeof userId !== 'string') {
      throw new BadRequestException('ID пользователя должен быть строкой');
    }

    try {
      const media = await this.mediaRepository.findOne({
        where: { id },
        relations: ['dialect', 'topics'],
      });
      if (!media) throw new NotFoundException(`Медиа с ID ${id} не найдено`);

      const [avg, allRatings] = await Promise.all([
        this.ratingsService.getAverage(TargetType.MEDIA, id),
        this.ratingsService.findByTarget(TargetType.MEDIA, id),
      ]);

      const userRating =
        userId !== undefined
          ? (allRatings.find(
              (r) => r.user_id === userId || r.user?.id === userId,
            )?.value ?? null)
          : null;

      const normalized = this.normalizeMediaPaths(media);

      return Object.assign(normalized, {
        dialogueGroupId: media.dialogueGroupId ?? null,
        averageRating: avg.average ?? 0,
        votes: avg.votes ?? 0,
        userRating,
      });
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Ошибка при получении медиа с рейтингом',
      );
    }
  }

  async create(data: Partial<Media>): Promise<Media> {
    if (!data || Object.keys(data).length === 0) {
      throw new BadRequestException('Данные медиа обязательны');
    }

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

  async update(id: number, dto: UpdateMediaRequestDto): Promise<Media> {
    if (!id || id <= 0) {
      throw new BadRequestException(
        'ID медиа должен быть положительным числом',
      );
    }

    if (!dto || Object.keys(dto).length === 0) {
      throw new BadRequestException('Нет данных для обновления');
    }

    try {
      const media = await this.mediaRepository.findOne({
        where: { id },
        relations: ['topics', 'dialect'],
      });
      if (!media) throw new NotFoundException(`Медиа с ID ${id} не найдено`);

      const prevMediaUrl = media.mediaUrl;

      if (dto.title !== undefined) media.title = dto.title;
      if (dto.mediaUrl !== undefined) media.mediaUrl = dto.mediaUrl;
      if (dto.previewUrl !== undefined) media.previewUrl = dto.previewUrl;
      if (dto.subtitlesLink !== undefined)
        media.subtitlesLink = dto.subtitlesLink;

      if (dto.type !== undefined) (media as any).type = dto.type;

      if (dto.licenseType !== undefined) media.licenseType = dto.licenseType;
      if (dto.licenseAuthor !== undefined)
        media.licenseAuthor = dto.licenseAuthor;

      if (dto.level !== undefined) (media as any).level = dto.level;

      if (dto.dialogueGroupId !== undefined)
        media.dialogueGroupId = dto.dialogueGroupId ?? null;

      if (dto.duration !== undefined) media.duration = dto.duration ?? null;
      if (dto.speaker !== undefined) media.speaker = dto.speaker ?? null;
      if (dto.sourceRole !== undefined)
        media.sourceRole = dto.sourceRole ?? null;

      if (dto.grammarLink !== undefined)
        media.grammarLink = dto.grammarLink ?? null;
      if (dto.resources !== undefined) media.resources = dto.resources ?? null;

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
        (saved as any).type === 'video' &&
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
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Ошибка при обновлении медиа');
    }
  }

  async remove(id: number): Promise<void> {
    if (!id || id <= 0) {
      throw new BadRequestException(
        'ID медиа должен быть положительным числом',
      );
    }

    try {
      const media = await this.mediaRepository.findOne({ where: { id } });
      if (!media) throw new NotFoundException(`Медиа с ID ${id} не найдено`);
      await this.mediaRepository.remove(media);
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Ошибка при удалении медиа');
    }
  }

  async findExercisesByMedia(mediaId: number) {
    if (!mediaId || mediaId <= 0) {
      throw new BadRequestException(
        'ID медиа должен быть положительным числом',
      );
    }

    try {
      return this.exerciseRepository.find({
        where: { media: { id: mediaId } },
        relations: ['items'],
        order: { id: 'ASC' },
      });
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Ошибка при получении упражнений для медиа',
      );
    }
  }

  async addExerciseToMedia(mediaId: number, dto: CreateExerciseDto) {
    if (!mediaId || mediaId <= 0) {
      throw new BadRequestException(
        'ID медиа должен быть положительным числом',
      );
    }

    if (!dto) {
      throw new BadRequestException('Данные упражнения обязательны');
    }

    try {
      const media = await this.mediaRepository.findOne({
        where: { id: mediaId },
      });
      if (!media)
        throw new NotFoundException(`Медиа с ID ${mediaId} не найдено`);

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

      return await this.exerciseRepository.save(
        this.exerciseRepository.create(exercise),
      );
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Ошибка при добавлении упражнения к медиа',
      );
    }
  }

  private normalizeMediaPaths(media: Media): Media {
    media.mediaUrl = makeAbsoluteUrl(media.mediaUrl);
    media.subtitlesLink = makeAbsoluteUrl(media.subtitlesLink);
    if (media.previewUrl) media.previewUrl = makeAbsoluteUrl(media.previewUrl);
    return media;
  }

  async generatePreview(mediaUrl: string): Promise<string> {
    if (!mediaUrl || typeof mediaUrl !== 'string' || mediaUrl.trim() === '') {
      throw new BadRequestException('URL медиа обязателен');
    }

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
    try {
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
        const values = toAdd.map((topic_id) => ({
          media_id: mediaId,
          topic_id,
        }));
        await manager
          .createQueryBuilder()
          .insert()
          .into('media_topics')
          .values(values as any)
          .execute();
      }
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Ошибка при синхронизации топиков медиа',
      );
    }
  }
}
