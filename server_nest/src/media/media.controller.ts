import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Put,
  Delete,
  ParseIntPipe,
  UploadedFile,
  UseInterceptors,
  Query,
  Sse,
  MessageEvent,
  Req,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { interval, Observable, switchMap } from 'rxjs';

import { MediaService } from './media.service';
import { Media } from './media.entity';
import { CreateExerciseDto } from 'src/articles/dto/create-exercise.dto';
import { RatingsService } from 'src/ratings/ratings.service';
import { CommentsService } from 'src/comments/comments.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';

@Controller('media')
export class MediaController {
  constructor(
    private readonly mediaService: MediaService,
    private readonly ratingsService: RatingsService,
    private readonly commentsService: CommentsService,
    private readonly jwtService: JwtService,
  ) {}

  /** 📜 Получить все медиа с фильтрацией */
  @Get()
  async findAll(
    @Query('name') name?: string,
    @Query('region') region?: string,
    @Query('topics') topics?: string,
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

  /** 🎬 Получить одно медиа по ID (включая рейтинг пользователя, если авторизован) */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const userId = req.user?.sub || req.user?.id;
    return this.mediaService.findOneWithRating(id, userId);
  }

  /** 🧩 Загрузка видео */
  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/videos',
        filename: (req, file, cb) => {
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
    const videoPath = file.path.replace(/\\/g, '/');
    const previewPath = await this.mediaService.generatePreview(videoPath);
    return this.mediaService.create({
      ...body,
      mediaUrl: videoPath,
      previewUrl: previewPath,
    });
  }

  /** ♻️ Обновить запись */
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Partial<Media>,
  ): Promise<Media> {
    return this.mediaService.update(id, data);
  }

  /** 🗑 Удалить запись */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.mediaService.remove(id);
  }

  /** 🧩 Получить упражнения по медиа */
  @Get(':id/exercises')
  @UseGuards(JwtAuthGuard) // ✅ доступ только авторизованным
  async findExercises(@Param('id', ParseIntPipe) id: number) {
    return this.mediaService.findExercisesByMedia(id);
  }

  /** ➕ Добавить упражнение */
  @Post(':id/exercises')
  @UseGuards(JwtAuthGuard)
  async addExerciseToMedia(
    @Param('id', ParseIntPipe) mediaId: number,
    @Body() dto: CreateExerciseDto,
  ) {
    return this.mediaService.addExerciseToMedia(mediaId, dto);
  }

  /** ⭐ Средний рейтинг */
  @Get(':id/rating')
  async getRating(@Param('id', ParseIntPipe) id: number) {
    return this.ratingsService.getAverage('media', id);
  }

  /** 💬 SSE-стрим комментариев */
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

  /** 🌟 SSE-стрим рейтинга */
  @Get('stream/:targetType/:targetId')
  @Sse()
  streamRatings(
    @Param('targetType')
    targetType: 'book' | 'article' | 'media' | 'textbook' | 'personality',
    @Param('targetId', ParseIntPipe) targetId: number,
  ): Observable<MessageEvent> {
    return interval(5000).pipe(
      switchMap(async () => {
        const { average, votes } = await this.ratingsService.getAverage(
          targetType,
          targetId,
        );

        // Возвращаем уже чистые числа, не вложенные объекты
        return { data: { average, votes } };
      }),
    );
  }
}
