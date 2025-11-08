import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  MessageEvent,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  Sse,
  UploadedFile,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { interval, Observable, switchMap } from 'rxjs';

import { CommentsService } from 'src/comments/comments.service';
import { FavoritesService } from 'src/favorites/favorites.service';
import { RatingsService } from 'src/ratings/ratings.service';
import { MediaService } from './media.service';

import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from 'src/auth/decorators/public.decorator';
import { Role } from 'src/auth/roles.enum';
import { TargetType } from 'src/common/enums/target-type.enum';

import { CreateMediaRequestDto } from './dto/create-media.request.dto';
import { MediaWithRatingResponseDto } from './dto/media-with-rating.response.dto';
import { MediaResponseDto } from './dto/media.response.dto';
import { UpdateMediaRequestDto } from './dto/update-media.request.dto';

import { Auth } from 'src/auth/decorators/auth.decorator';
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

  @ApiOperation({ summary: 'Список медиа (публично)' })
  @ApiResponse({
    status: 200,
    description: 'Список медиа',
    type: [MediaResponseDto],
  })
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

  @ApiOperation({
    summary: 'Просмотр конкретного медиа (только авторизованные)',
  })
  @ApiBearerAuth('access-token')
  @Auth()
  @ApiParam({ name: 'id', example: 1, description: 'ID медиа' })
  @ApiResponse({
    status: 200,
    description: 'Информация о медиа',
    type: MediaWithRatingResponseDto,
  })
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ): Promise<MediaWithRatingResponseDto> {
    const result = await this.mediaService.findOneWithRating(id, req.user.id);

    const dto = mapToDto(MediaWithRatingResponseDto, result);
    dto.averageRating = (result as any).averageRating;
    dto.votes = (result as any).votes;
    dto.userRating = (result as any).userRating ?? null;

    return dto;
  }

  @ApiOperation({ summary: 'Загрузить медиа-файл (ADMIN+)' })
  @ApiBearerAuth('access-token')
  @Auth(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiResponse({
    status: 201,
    description: 'Медиа создано',
    type: MediaResponseDto,
  })
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

  @ApiOperation({ summary: 'Обновить медиа (ADMIN+)' })
  @ApiBearerAuth('access-token')
  @Auth(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiParam({ name: 'id', example: 1, description: 'ID медиа' })
  @ApiResponse({
    status: 200,
    description: 'Медиа обновлено',
    type: MediaResponseDto,
  })
  @Put(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMediaRequestDto,
  ): Promise<MediaResponseDto> {
    const updated = await this.mediaService.update(id, dto);
    return mapToDto(MediaResponseDto, updated);
  }

  @ApiOperation({ summary: 'Удалить медиа (ADMIN+)' })
  @ApiBearerAuth('access-token')
  @Auth(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiParam({ name: 'id', example: 1, description: 'ID медиа' })
  @ApiResponse({ status: 200, description: 'Медиа удалено', type: Object })
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.mediaService.remove(id);
    return { success: true };
  }

  @ApiOperation({ summary: 'Средний рейтинг (публично)' })
  @ApiParam({ name: 'id', example: 1, description: 'ID медиа' })
  @ApiResponse({
    status: 200,
    description: 'Средний рейтинг и количество голосов',
    type: Object,
  })
  @Get(':id/rating')
  async getRating(@Param('id', ParseIntPipe) id: number) {
    return this.ratingsService.getAverage(TargetType.MEDIA, id);
  }

  @ApiOperation({ summary: 'SSE: комментарии (публично)' })
  @ApiParam({ name: 'id', example: 1, description: 'ID медиа' })
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

  @ApiOperation({ summary: 'SSE: рейтинг (публично)' })
  @ApiParam({ name: 'id', example: 1, description: 'ID медиа' })
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

  @ApiOperation({ summary: 'Добавить медиа в избранное' })
  @ApiBearerAuth('access-token')
  @Auth()
  @ApiParam({ name: 'id', example: 1, description: 'ID медиа' })
  @ApiResponse({
    status: 201,
    description: 'Добавлено в избранное',
    type: Object,
  })
  @Post(':id/favorite')
  async addToFavorites(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.favoritesService.addToFavorites(req.user.id, {
      targetType: TargetType.MEDIA,
      targetId: id,
    });
  }

  @ApiOperation({ summary: 'Удалить медиа из избранного' })
  @ApiBearerAuth('access-token')
  @Auth()
  @ApiParam({ name: 'id', example: 1, description: 'ID медиа' })
  @ApiResponse({
    status: 200,
    description: 'Удалено из избранного',
    type: Object,
  })
  @Delete(':id/favorite')
  async removeFromFavorites(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    return this.favoritesService.removeFromFavorites(req.user.id, {
      targetType: TargetType.MEDIA,
      targetId: id,
    });
  }
}
