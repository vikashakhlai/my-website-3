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
import { ApiBearerAuth, ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { TargetType } from 'src/common/enums/target-type.enum';
import { UpdateMediaDto } from './dto/update-media.dto';

@ApiTags('Media')
@Controller('media')
export class MediaController {
  constructor(
    private readonly mediaService: MediaService,
    private readonly ratingsService: RatingsService,
    private readonly commentsService: CommentsService,
  ) {}

  /** 📜 Публичный список медиа с фильтрами */
  @ApiOperation({ summary: 'Список медиа (публично)' })
  @Get()
  async findAll(
    @Query('name') name?: string,
    @Query('region') region?: string,
    @Query('topics') topics?: string,
  ): Promise<Media[]> {
    const topicIds = (topics ?? '')
      .split(',')
      .map((v) => Number(v))
      .filter((v) => !Number.isNaN(v));

    return this.mediaService.findAllWithFilters({
      name: name || undefined,
      region: region || undefined,
      topics: topicIds.length ? topicIds : undefined,
    });
  }

  /** 🎬 Просмотр конкретного медиа — только авторизованные */
  @ApiOperation({ summary: 'Получить медиа (только авторизованные)' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.mediaService.findOneWithRating(id, req.user.sub);
  }

  /** ⬆️ Загрузка файла (ADMIN+) */
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
          const safe = file.originalname
            .replace(/\s+/g, '_')
            .replace(/[^a-zA-Z0-9_\.-]/g, '');
          cb(null, `${Date.now()}_${safe}`);
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
      limits: { fileSize: 500 * 1024 * 1024 },
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

  /** 🔄 Обновить (ADMIN+) — topics: sync; preview: auto при смене mediaUrl */
  @ApiOperation({ summary: 'Обновить медиа (ADMIN+)' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMediaDto,
  ) {
    return this.mediaService.update(id, dto);
  }

  /** 🗑 Удалить (ADMIN+) */
  @ApiOperation({ summary: 'Удалить медиа (ADMIN+)' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.mediaService.remove(id);
  }

  /** 🧩 Exercises — только авторизованные */
  @ApiOperation({ summary: 'Список упражнений (только авторизованные)' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Get(':id/exercises')
  async findExercises(@Param('id', ParseIntPipe) id: number) {
    return this.mediaService.findExercisesByMedia(id);
  }

  @ApiOperation({
    summary: 'Добавить упражнение к медиа (только авторизованные)',
  })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Post(':id/exercises')
  async addExerciseToMedia(
    @Param('id', ParseIntPipe) mediaId: number,
    @Body() dto: CreateExerciseDto,
  ) {
    return this.mediaService.addExerciseToMedia(mediaId, dto);
  }

  /** ⭐ Средний рейтинг (публично) */
  @ApiOperation({ summary: 'Средний рейтинг (публично)' })
  @Get(':id/rating')
  async getRating(@Param('id', ParseIntPipe) id: number) {
    return this.ratingsService.getAverage(TargetType.MEDIA, id);
  }

  /** 💬 SSE комментариев (публично) */
  @ApiOperation({ summary: 'SSE: комментарии (публично)' })
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

  /** 🌟 SSE рейтинга (публично) */
  @ApiOperation({ summary: 'SSE: рейтинг (публично)' })
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
