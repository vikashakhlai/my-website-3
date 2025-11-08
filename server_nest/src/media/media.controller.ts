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
import { RatingsService } from 'src/ratings/ratings.service';
import { CommentsService } from 'src/comments/comments.service';
import { FavoritesService } from 'src/favorites/favorites.service';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Role } from 'src/auth/roles.enum';
import { Public } from 'src/auth/decorators/public.decorator';
import {
  ApiBearerAuth,
  ApiSecurity,
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiConsumes,
  ApiParam,
} from '@nestjs/swagger';
import { TargetType } from 'src/common/enums/target-type.enum';

import { CreateMediaRequestDto } from './dto/create-media.request.dto';
import { UpdateMediaRequestDto } from './dto/update-media.request.dto';
import { MediaResponseDto } from './dto/media.response.dto';
import { MediaWithRatingResponseDto } from './dto/media-with-rating.response.dto';

import { mapToDto } from 'src/common/utils/map-to-dto.util';

@ApiTags('Media')
@Controller('media')
export class MediaController {
  constructor(
    private readonly mediaService: MediaService,
    private readonly ratingsService: RatingsService,
    private readonly commentsService: CommentsService,
    private readonly favoritesService: FavoritesService,
  ) {}

  /** 📜 Публичный список медиа с фильтрами */
  @ApiOperation({ summary: 'Список медиа (публично)' })
  @ApiOkResponse({ type: MediaResponseDto, isArray: true })
  @Public()
  @Get()
  async findAll(
    @Query('name') name?: string,
    @Query('region') region?: string,
    @Query('topics') topics?: string,
  ): Promise<MediaResponseDto[]> {
    const topicIds = (topics ?? '')
      .split(',')
      .map((v) => Number(v))
      .filter((v) => v > 0);

    const hasFilters =
      (name ?? '').trim().length > 0 ||
      (region ?? '').trim().length > 0 ||
      topicIds.length > 0;

    if (!hasFilters) {
      const list = await this.mediaService.findAll();
      return list.map((m) => mapToDto(MediaResponseDto, m));
    }

    const list = await this.mediaService.findAllWithFilters({
      name: name?.trim(),
      region: region?.trim(),
      topics: topicIds,
    });
    return list.map((m) => mapToDto(MediaResponseDto, m));
  }

  /** 📍 Получить список регионов с количеством медиа (публично) */
  @Public()
  @ApiOperation({
    summary: 'Получить список регионов с количеством медиа',
    description: 'Возвращает список всех регионов, где есть медиа-контент, с количеством медиа в каждом регионе.',
  })
  @ApiOkResponse({
    description: 'Список регионов с количеством',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          region: { type: 'string', example: 'Египет' },
          count: { type: 'string', example: '15' },
        },
      },
      example: [
        { region: 'Египет', count: '15' },
        { region: 'Сирия', count: '8' },
      ],
    },
  })
  @Get('regions')
  async getRegions() {
    return this.mediaService.getRegionsWithCount();
  }

  /** 🎬 Просмотр конкретного медиа — только авторизованные */
  @ApiOperation({
    summary: 'Получить медиа-контент по ID',
    description: 'Возвращает полную информацию о медиа-контенте, включая рейтинг и избранное. Требуется авторизация.',
  })
  @ApiParam({
    name: 'id',
    description: 'Уникальный идентификатор медиа-контента',
    type: Number,
    example: 10,
  })
  @ApiOkResponse({ type: MediaWithRatingResponseDto })
  @ApiBearerAuth('access-token')
  @ApiSecurity('access-token')
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ): Promise<MediaWithRatingResponseDto> {
    const result = await this.mediaService.findOneWithRating(id, req.user.sub);

    const dto = mapToDto(MediaWithRatingResponseDto, result);
    dto.averageRating = (result as any).averageRating;
    dto.votes = (result as any).votes;
    dto.userRating = (result as any).userRating ?? null;

    return dto;
  }

  /** 📥 Загрузка файла (ADMIN+) */
  @ApiOperation({ summary: 'Загрузить медиа-файл (ADMIN+)' })
  @ApiOkResponse({ type: MediaResponseDto })
  @ApiBearerAuth('access-token')
  @ApiSecurity('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Post('upload')
  @ApiConsumes('multipart/form-data')
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
    @Body() body: CreateMediaRequestDto,
  ): Promise<MediaResponseDto> {
    const videoPath = file.path.replace(/\\/g, '/');
    const previewPath = await this.mediaService.generatePreview(videoPath);
    const created = await this.mediaService.create({
      ...body,
      mediaUrl: videoPath,
      previewUrl: previewPath,
    });
    return mapToDto(MediaResponseDto, created);
  }

  /** 🔄 Обновить (ADMIN+) */
  @ApiOperation({ summary: 'Обновить медиа (ADMIN+)' })
  @ApiParam({
    name: 'id',
    description: 'Уникальный идентификатор медиа-контента',
    type: Number,
    example: 10,
  })
  @ApiOkResponse({ type: MediaResponseDto })
  @ApiBearerAuth('access-token')
  @ApiSecurity('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMediaRequestDto,
  ): Promise<MediaResponseDto> {
    const updated = await this.mediaService.update(id, dto);
    return mapToDto(MediaResponseDto, updated);
  }

  /** 🗑 Удалить (ADMIN+) */
  @ApiOperation({ summary: 'Удалить медиа (ADMIN+)' })
  @ApiParam({
    name: 'id',
    description: 'Уникальный идентификатор медиа-контента',
    type: Number,
    example: 10,
  })
  @ApiBearerAuth('access-token')
  @ApiSecurity('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.mediaService.remove(id);
    return { success: true };
  }

  /** ⭐ Средний рейтинг (публично) */
  @ApiOperation({ summary: 'Средний рейтинг (публично)' })
  @ApiParam({
    name: 'id',
    description: 'Уникальный идентификатор медиа-контента',
    type: Number,
    example: 10,
  })
  @Get(':id/rating')
  async getRating(@Param('id', ParseIntPipe) id: number) {
    return this.ratingsService.getAverage(TargetType.MEDIA, id);
  }

  /** 💬 SSE комментариев (публично) */
  @ApiOperation({ summary: 'SSE: комментарии (публично)' })
  @ApiParam({
    name: 'id',
    description: 'Уникальный идентификатор медиа-контента',
    type: Number,
    example: 10,
  })
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
  @ApiParam({
    name: 'id',
    description: 'Уникальный идентификатор медиа-контента',
    type: Number,
    example: 10,
  })
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

  /** 💛 Добавить в избранное */
  @ApiOperation({ summary: 'Добавить медиа в избранное' })
  @ApiParam({
    name: 'id',
    description: 'Уникальный идентификатор медиа-контента',
    type: Number,
    example: 10,
  })
  @ApiBearerAuth('access-token')
  @ApiSecurity('access-token')
  @UseGuards(JwtAuthGuard)
  @Post(':id/favorite')
  async addToFavorites(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.favoritesService.addToFavorites(req.user.sub, {
      targetType: TargetType.MEDIA,
      targetId: id,
    });
  }

  /** 💔 Удалить из избранного */
  @ApiOperation({ summary: 'Удалить медиа из избранного' })
  @ApiParam({
    name: 'id',
    description: 'Уникальный идентификатор медиа-контента',
    type: Number,
    example: 10,
  })
  @ApiBearerAuth('access-token')
  @ApiSecurity('access-token')
  @UseGuards(JwtAuthGuard)
  @Delete(':id/favorite')
  async removeFromFavorites(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    return this.favoritesService.removeFromFavorites(req.user.sub, {
      targetType: TargetType.MEDIA,
      targetId: id,
    });
  }
}
