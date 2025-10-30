// src/media/media.controller.ts
import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Put,
  Delete,
  ParseIntPipe,
  NotFoundException,
  UploadedFile,
  UseInterceptors,
  Query,
  Sse,
  MessageEvent,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { interval, Observable, switchMap } from 'rxjs';

import { MediaService } from './media.service';
import { Media } from './media.entity';
import { CreateExerciseDto } from 'src/articles/dto/create-exercise.dto';

// ✅ добавляем сервисы для рейтингов и комментариев
import { RatingsService } from 'src/ratings/ratings.service';
import { CommentsService } from 'src/comments/comments.service';

@Controller('media')
export class MediaController {
  constructor(
    private readonly mediaService: MediaService,
    private readonly ratingsService: RatingsService,
    private readonly commentsService: CommentsService,
  ) {}

  /** 📜 Получить все медиа с фильтрацией */
  @Get()
  async findAll(
    @Query('name') name?: string,
    @Query('region') region?: string,
    @Query('topics') topics?: string, // "1,2,3"
  ): Promise<Media[]> {
    const topicIds = topics
      ? topics
          .split(',')
          .map((id) => parseInt(id.trim(), 10))
          .filter((id) => !isNaN(id))
      : [];

    return this.mediaService.findAllWithFilters({
      name,
      region,
      topics: topicIds,
    });
  }

  /** 🎬 Получить одно медиа по ID */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Media> {
    const media = await this.mediaService.findOne(id);
    if (!media) throw new NotFoundException(`Медиа с id=${id} не найдено`);
    return media;
  }

  /** 🧩 Загрузка видео и автоматическая генерация превью */
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/videos',
        filename: (
          req: Express.Request,
          file: Express.Multer.File,
          cb: (error: Error | null, filename: string) => void,
        ) => {
          const uniqueName = `${Date.now()}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
    }),
  )
  async uploadVideo(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: Partial<Media>,
  ): Promise<Media> {
    const videoPath = file.path.split('\\').join('/');

    const previewPath = await this.mediaService.generatePreview(videoPath);

    return this.mediaService.create({
      ...body,
      mediaUrl: videoPath,
      previewUrl: previewPath,
    });
  }

  /** ♻️ Обновить запись */
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Partial<Media>,
  ): Promise<Media> {
    return this.mediaService.update(id, data);
  }

  /** 🗑 Удалить запись */
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.mediaService.remove(id);
  }

  /** 🧩 Получить упражнения, связанные с конкретным медиа */
  @Get(':id/exercises')
  async findExercises(@Param('id', ParseIntPipe) id: number) {
    return this.mediaService.findExercisesByMedia(id);
  }

  /** ➕ Создать упражнение, связанное с медиа */
  @Post(':id/exercises')
  async addExerciseToMedia(
    @Param('id', ParseIntPipe) mediaId: number,
    @Body() dto: CreateExerciseDto,
  ) {
    return this.mediaService.addExerciseToMedia(mediaId, dto);
  }

  // =========================
  // 🔔 РЕЙТИНГИ И КОММЕНТАРИИ
  // =========================

  /** ⭐ Средний рейтинг и количество голосов по медиа */
  @Get(':id/rating')
  async getRating(@Param('id', ParseIntPipe) id: number) {
    // фронт использует targetType="media"
    return this.ratingsService.getAverage('media', id);
  }

  /** 💬 SSE-стрим комментариев по медиа (реал-тайм) */
  @Get('stream/:id/comments')
  @Sse()
  streamComments(
    @Param('id', ParseIntPipe) id: number,
  ): Observable<MessageEvent> {
    return interval(5000).pipe(
      switchMap(async () => {
        const comments = await this.commentsService.findByTarget('media', id);
        return { data: comments };
      }),
    );
  }
}
