import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Media } from './media.entity';
import { Exercise } from 'src/articles/entities/exercise.entity';
import { makeAbsoluteUrl } from 'src/utils/media-url.util';
import { spawn } from 'child_process';
import ffmpegPath from 'ffmpeg-static';
import { join, parse, dirname } from 'path';
import { promises as fs } from 'fs';

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(Media)
    private readonly mediaRepository: Repository<Media>,

    @InjectRepository(Exercise)
    private readonly exerciseRepository: Repository<Exercise>,
  ) {}

  /** 📜 Получить все медиа */
  async findAll(): Promise<Media[]> {
    return this.mediaRepository.find({
      relations: ['dialect'],
      order: { createdAt: 'DESC' },
    });
  }

  /** 🎬 Получить одно медиа по ID */
  async findOne(id: number): Promise<Media> {
    const media = await this.mediaRepository.findOne({
      where: { id },
      relations: ['exercises', 'exercises.items'],
    });

    if (!media) {
      throw new NotFoundException(`Медиа с ID ${id} не найдено`);
    }

    // ✅ Конвертируем относительные пути в абсолютные URL
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

    return saved;
  }

  /** ♻️ Обновить запись */
  async update(id: number, data: Partial<Media>): Promise<Media> {
    const media = await this.findOne(id);
    Object.assign(media, data);
    return this.mediaRepository.save(media);
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

  /** 🎞 Генерация превью с помощью ffmpeg */
  async generatePreview(mediaUrl: string): Promise<string> {
    try {
      const uploadsRoot = join(process.cwd(), 'uploads');
      const videoPath = mediaUrl.includes(uploadsRoot)
        ? mediaUrl
        : join(uploadsRoot, mediaUrl.replace(/^\/?uploads[\\/]/, ''));

      const { dir, name } = parse(videoPath);
      const outputDir = join(dirname(videoPath), '..', 'thumbnails');
      await fs.mkdir(outputDir, { recursive: true });

      const outputPath = join(outputDir, `${name}-preview.jpg`);

      // Проверяем, существует ли файл видео
      await fs.access(videoPath);

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
          code === 0
            ? resolve()
            : reject(
                new InternalServerErrorException(
                  'FFmpeg не смог создать превью',
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
}
