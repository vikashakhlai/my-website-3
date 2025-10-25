import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Media } from './media.entity';
import { Exercise } from 'src/articles/entities/exercise.entity';
import { makeAbsoluteUrl } from 'src/utils/media-url.util';

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
      order: { createdAt: 'DESC' },
    });
  }

  /** 🎬 Получить одно медиа по ID (с упражнениями и их пунктами) */
  async findOne(id: number): Promise<Media> {
    const media = await this.mediaRepository.findOne({
      where: { id },
      relations: ['exercises', 'exercises.items'],
    });

    if (!media) {
      throw new NotFoundException(`Медиа с ID ${id} не найдено`);
    }

    // ✅ Преобразуем пути в абсолютные URL
    media.mediaUrl = makeAbsoluteUrl(media.mediaUrl);
    media.subtitlesLink = makeAbsoluteUrl(media.subtitlesLink);

    return media;
  }

  /** ➕ Создать запись */
  async create(data: Partial<Media>): Promise<Media> {
    const newMedia = this.mediaRepository.create(data);
    return this.mediaRepository.save(newMedia);
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
}
