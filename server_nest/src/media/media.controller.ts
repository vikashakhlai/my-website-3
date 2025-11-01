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
  BadRequestException,
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
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Role } from 'src/auth/roles.enum';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { TargetType } from 'src/common/enums/target-type.enum';

@ApiTags('Media')
@Controller('media')
export class MediaController {
  constructor(
    private readonly mediaService: MediaService,
    private readonly ratingsService: RatingsService,
    private readonly commentsService: CommentsService,
  ) {}

  /** 📜 Публичный список медиа */
  @ApiOperation({ summary: 'Список медиа (публично)' })
  @Get()
  async findAll(
    @Query('name') name?: string,
    @Query('region') region?: string,
    @Query('topics') topics?: string,
  ): Promise<Media[]> {
    const topicIds = topics
      ? topics
          .split(',')
          .map((id) => Number(id))
          .filter((id) => !isNaN(id))
      : [];
    return this.mediaService.findAllWithFilters({
      name,
      region,
      topics: topicIds,
    });
  }

  /** 🎬 Только авторизованные видят детали + userRating */
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.mediaService.findOneWithRating(id, req.user?.sub);
  }

  /** ⬆️ Загрузка медиа (ADMIN+) */
  @ApiOperation({ summary: 'Загрузить медиа-файл (ADMIN+)' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/media',
        filename: (req, file, cb) => {
          const safeName = file.originalname
            .replace(/\s+/g, '_')
            .replace(/[^a-zA-Z0-9_\.-]/g, '');
          const uniqueName = `${Date.now()}_${safeName}`;
          cb(null, uniqueName);
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowed = ['.mp4', '.webm', '.mkv', '.mp3'];
        const ext = extname(file.originalname).toLowerCase();
        if (!allowed.includes(ext)) {
          return cb(
            new BadRequestException(`Недопустимый формат файла: ${ext}`),
            false,
          );
        }
        cb(null, true);
      },
      limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
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

  /** 🔄 Обновить медиа (ADMIN+) */
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Partial<Media>,
  ) {
    return this.mediaService.update(id, data);
  }

  /** 🗑 Удалить медиа (ADMIN+) */
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.mediaService.remove(id);
  }

  /** 🧩 Упражнения — авторизованные */
  @UseGuards(JwtAuthGuard)
  @Get(':id/exercises')
  async findExercises(@Param('id', ParseIntPipe) id: number) {
    return this.mediaService.findExercisesByMedia(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/exercises')
  async addExerciseToMedia(
    @Param('id', ParseIntPipe) mediaId: number,
    @Body() dto: CreateExerciseDto,
  ) {
    return this.mediaService.addExerciseToMedia(mediaId, dto);
  }

  /** ⭐ Средний рейтинг */
  @Get(':id/rating')
  async getRating(@Param('id', ParseIntPipe) id: number) {
    return this.ratingsService.getAverage(TargetType.MEDIA, id);
  }

  /** 💬 SSE комментариев */
  @Sse('stream/:id/comments')
  streamComments(
    @Param('id', ParseIntPipe) id: number,
  ): Observable<MessageEvent> {
    return interval(5000).pipe(
      switchMap(async () => ({
        data: await this.commentsService.findByTarget(TargetType.MEDIA, id),
      })),
    );
  }

  /** 🌟 SSE рейтинга */
  @Sse('stream/:id/rating')
  streamRatings(
    @Param('id', ParseIntPipe) id: number,
  ): Observable<MessageEvent> {
    return interval(5000).pipe(
      switchMap(async () => {
        const { average, votes } = await this.ratingsService.getAverage(
          TargetType.MEDIA,
          id,
        );
        return { data: { average, votes } };
      }),
    );
  }
}
