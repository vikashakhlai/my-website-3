import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { Media } from './media.entity';
import { Exercise } from 'src/articles/entities/exercise.entity';
import { makeAbsoluteUrl } from 'src/utils/media-url.util';
import { spawn } from 'child_process';
import ffmpegPath from 'ffmpeg-static';
import { join, parse, dirname } from 'path';
import { promises as fs } from 'fs';
import { CreateExerciseDto } from 'src/articles/dto/create-exercise.dto';
import { ExerciseItem } from 'src/articles/entities/exercise-item.entity';
import { RatingsService } from 'src/ratings/ratings.service';
import { CommentsService } from 'src/comments/comments.service';
import { TargetType } from 'src/common/enums/target-type.enum';

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(Media)
    private readonly mediaRepository: Repository<Media>,

    @InjectRepository(Exercise)
    private readonly exerciseRepository: Repository<Exercise>,

    private readonly ratingsService: RatingsService,
    private readonly commentsService: CommentsService,
  ) {}

  /** 📜 Получить все медиа */
  async findAll(): Promise<Media[]> {
    const medias = await this.mediaRepository.find({
      relations: ['dialect', 'topics'], // ✅ добавили связь
      order: { createdAt: 'DESC' },
    });

    // 🧭 Преобразуем пути в абсолютные URL
    return medias.map((media) => this.normalizeMediaPaths(media));
  }

  /** 🎬 Получить одно медиа по ID */
  async findOne(id: number): Promise<Media> {
    const media = await this.mediaRepository.findOne({
      where: { id },
      relations: ['dialect', 'topics', 'exercises', 'exercises.items'], // ✅ добавили topics
    });

    if (!media) {
      throw new NotFoundException(`Медиа с ID ${id} не найдено`);
    }

    return this.normalizeMediaPaths(media);
  }

  async findAllWithFilters(filters: {
    name?: string;
    region?: string;
    topics?: number[];
  }): Promise<Media[]> {
    const query = this.mediaRepository
      .createQueryBuilder('media')
      .leftJoinAndSelect('media.dialect', 'dialect')
      .leftJoinAndSelect('media.topics', 'topics')
      .orderBy('media.createdAt', 'DESC');

    // === фильтр по названию ===
    if (filters.name) {
      query.andWhere('LOWER(media.title) LIKE LOWER(:name)', {
        name: `%${filters.name}%`,
      });
    }

    // === фильтр по региону ===
    if (filters.region) {
      query.andWhere('LOWER(dialect.region) LIKE LOWER(:region)', {
        region: `%${filters.region}%`,
      });
    }

    // === фильтр по темам (логика AND через подзапрос) ===
    const topics = filters.topics ?? [];

    if (topics.length > 0) {
      query.andWhere((qb) => {
        const subQuery = qb
          .subQuery()
          .select('mt.media_id')
          .from('media_topics', 'mt')
          .where('mt.topic_id IN (:...topics)', { topics })
          .groupBy('mt.media_id')
          .having('COUNT(DISTINCT mt.topic_id) = :topicsCount', {
            topicsCount: topics.length,
          })
          .getQuery();

        return 'media.id IN ' + subQuery;
      });
    }

    const medias = await query.getMany();
    return medias.map((m) => this.normalizeMediaPaths(m));
  }

  /** 🔧 Преобразует относительные пути в абсолютные */
  private normalizeMediaPaths(media: Media): Media {
    media.mediaUrl = makeAbsoluteUrl(media.mediaUrl);
    media.subtitlesLink = makeAbsoluteUrl(media.subtitlesLink);
    if (media.previewUrl) {
      media.previewUrl = makeAbsoluteUrl(media.previewUrl);
    }
    return media;
  }

  /** ➕ Создать запись */
  async create(data: Partial<Media>): Promise<Media> {
    const newMedia = this.mediaRepository.create(data);
    const saved = await this.mediaRepository.save(newMedia);

    // ⚙️ Если это видео — создаём превью
    if (saved.type === 'video' && saved.mediaUrl) {
      try {
        const previewPath = await this.generatePreview(saved.mediaUrl);
        saved.previewUrl = previewPath;
        await this.mediaRepository.save(saved);
      } catch (err) {
        console.error('❌ Ошибка при создании превью:', err);
      }
    }

    return this.normalizeMediaPaths(saved);
  }

  /** ♻️ Обновить запись */
  async update(id: number, data: Partial<Media>): Promise<Media> {
    const media = await this.findOne(id);
    Object.assign(media, data);
    const updated = await this.mediaRepository.save(media);
    return this.normalizeMediaPaths(updated);
  }

  /** 🗑 Удалить запись */
  async remove(id: number): Promise<void> {
    const media = await this.findOne(id);
    await this.mediaRepository.remove(media);
  }

  /** 🧩 Получить упражнения, связанные с конкретным видео/аудио */
  async findExercisesByMedia(mediaId: number): Promise<Exercise[]> {
    return this.exerciseRepository.find({
      where: { media: { id: mediaId } },
      relations: ['items'],
      order: { id: 'ASC' },
    });
  }

  async addExerciseToMedia(
    mediaId: number,
    dto: CreateExerciseDto,
  ): Promise<Exercise> {
    const media = await this.mediaRepository.findOne({
      where: { id: mediaId },
    });
    if (!media) throw new NotFoundException(`Медиа с ID ${mediaId} не найдено`);

    // 🧩 устраняем дубликаты по questionRu
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
      media, // связь ManyToOne
      distractorPoolId: dto.distractorPoolId,
      items: dto.items?.map((item, index) => {
        const entity = new ExerciseItem();
        entity.position = index + 1;
        entity.questionRu = item.questionRu ?? undefined;
        entity.questionAr = item.questionAr ?? undefined;
        entity.partBefore = item.partBefore ?? undefined;
        entity.partAfter = item.partAfter ?? undefined;
        entity.correctAnswer = item.correctAnswer ?? undefined;
        entity.wordRu = item.wordRu ?? undefined;
        entity.wordAr = item.wordAr ?? undefined;
        entity.distractors = item.distractors ?? [];
        return entity;
      }) as DeepPartial<ExerciseItem>[],
    };

    const entity = this.exerciseRepository.create(exercise);
    return await this.exerciseRepository.save(entity);
  }

  /** 🎞 Генерация превью с помощью ffmpeg */
  /** 🎞 Генерация превью с помощью ffmpeg */
  async generatePreview(mediaUrl: string): Promise<string> {
    try {
      const uploadsRoot = join(process.cwd(), 'uploads');
      const videoPath = mediaUrl.includes(uploadsRoot)
        ? mediaUrl
        : join(uploadsRoot, mediaUrl.replace(/^\/?uploads[\\/]/, ''));

      const { name } = parse(videoPath);
      const outputDir = join(dirname(videoPath), '..', 'thumbnails');
      await fs.mkdir(outputDir, { recursive: true });

      const outputPath = join(outputDir, `${name}-preview.jpg`);

      // Проверяем, существует ли файл видео
      await fs.access(videoPath);

      // 🧠 Запускаем ffmpeg и ожидаем завершения
      await new Promise<void>((resolve, reject) => {
        const ffmpeg = spawn(ffmpegPath as string, [
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

        ffmpeg.on('close', (code) => {
          if (code === 0) {
            resolve();
          } else {
            reject(
              new InternalServerErrorException(
                `FFmpeg завершился с кодом ${code} и не смог создать превью`,
              ),
            );
          }
        });

        ffmpeg.on('error', (err) => {
          reject(
            new InternalServerErrorException(
              `Ошибка запуска FFmpeg: ${err.message}`,
            ),
          );
        });
      });

      console.log('✅ Превью создано:', outputPath);

      // Возвращаем относительный путь
      return outputPath.replace(uploadsRoot, '/uploads').replace(/\\/g, '/');
    } catch (err) {
      console.error('❌ Ошибка генерации превью:', err);
      throw err;
    }
  }

  /** 🎬 Получить медиа с рейтингом и рейтингом пользователя */
  async findOneWithRating(id: number, userId?: string): Promise<any> {
    // 1️⃣ Загружаем само медиа
    const media = await this.mediaRepository.findOne({
      where: { id },
      relations: ['dialect', 'topics', 'exercises', 'exercises.items'],
    });

    if (!media) throw new NotFoundException(`Медиа с ID ${id} не найдено`);

    // 2️⃣ Получаем средний рейтинг и все оценки
    const [average, allRatings] = await Promise.all([
      this.ratingsService.getAverage(TargetType.MEDIA, id),
      this.ratingsService.findByTarget(TargetType.MEDIA, id),
    ]);

    // 3️⃣ Ищем пользовательскую оценку (UUID — сравнение строк)
    const userRating =
      userId !== undefined
        ? (allRatings.find((r) => r.user_id === userId || r.user?.id === userId)
            ?.value ?? null)
        : null;

    // 4️⃣ Возвращаем итоговый объект
    return {
      ...this.normalizeMediaPaths(media),
      averageRating: average.average ?? 0,
      votes: average.votes ?? 0,
      userRating,
    };
  }
}
