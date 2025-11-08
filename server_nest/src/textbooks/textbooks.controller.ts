import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
  Request,
  Sse,
  MessageEvent,
} from '@nestjs/common';
import { interval, Observable, switchMap } from 'rxjs';

import { TextbooksService } from './textbooks.service';
import { RatingsService } from 'src/ratings/ratings.service';
import { FavoritesService } from 'src/favorites/favorites.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from 'src/auth/decorators/public.decorator';
import { CreateTextbookDto } from './dto/create-textbook.dto';
import { UpdateTextbookDto } from './dto/update-textbook.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { Role } from 'src/auth/roles.enum';
import { TargetType } from 'src/common/enums/target-type.enum';
import { OptionalJwtAuthGuard } from 'src/auth/guards/optional-jwt.guard';

@ApiTags('Textbooks')
@Controller('textbooks')
export class TextbooksController {
  constructor(
    private readonly textbooksService: TextbooksService,
    private readonly ratingsService: RatingsService,
    private readonly favoritesService: FavoritesService,
  ) {}

  /** 📚 Список учебников (публично) */
  @Public()
  @ApiOperation({ summary: 'Список учебников (публично)' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Номер страницы',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Количество элементов на странице',
    example: 10,
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    enum: ['asc', 'desc'],
    description: 'Порядок сортировки',
    example: 'asc',
  })
  @ApiQuery({
    name: 'level',
    required: false,
    type: String,
    description: 'Уровень сложности учебника',
    example: 'beginner',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Поисковый запрос',
    example: 'арабский язык',
  })
  @Get()
  async getAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('sort') sort?: 'asc' | 'desc',
    @Query('level') level?: string,
    @Query('search') search?: string,
  ) {
    return this.textbooksService.getAll({ page, limit, sort, level, search });
  }

  /** 📖 Просмотр одного учебника (публично) */
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({
    summary: 'Получить учебник (публично)',
    description:
      'Возвращает полную информацию об учебнике, включая описание, рейтинги и ссылки на файлы. Публичный эндпоинт, не требует аутентификации. If the request includes a valid JWT token, the response will also include `userRating` and `canDownload`.',
  })
  @ApiParam({
    name: 'id',
    description: 'Уникальный идентификатор учебника',
    type: Number,
    example: 1,
  })
  @Get(':id')
  async getPublic(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    const userId = req.user?.sub ?? null;
    return this.textbooksService.getPublicView(id, userId);
  }

  /** 📥 Скачать PDF — только авторизованные */
  @ApiOperation({ summary: 'Скачать учебник (только авторизованные)' })
  @ApiParam({
    name: 'id',
    description: 'Уникальный идентификатор учебника',
    type: Number,
    example: 1,
  })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Get(':id/download')
  async download(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.textbooksService.getDownloadFile(id, req.user.sub);
  }

  /** 🎲 Случайный учебник — публично */
  @Public()
  @ApiOperation({ summary: 'Случайный учебник (публично)' })
  @Get('random/one')
  getRandom() {
    return this.textbooksService.getRandom();
  }

  /** 🛠 Создать (SUPER_ADMIN) */
  @ApiOperation({ summary: 'Создать новый учебник (SUPER_ADMIN)' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @Post()
  create(@Body() dto: CreateTextbookDto) {
    return this.textbooksService.create(dto);
  }

  /** 🛠 Обновить (SUPER_ADMIN) */
  @ApiOperation({ summary: 'Обновить учебник (SUPER_ADMIN)' })
  @ApiParam({
    name: 'id',
    description: 'Уникальный идентификатор учебника',
    type: Number,
    example: 1,
  })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTextbookDto,
  ) {
    return this.textbooksService.update(id, dto);
  }

  /** 🗑 Удалить (SUPER_ADMIN) */
  @ApiOperation({ summary: 'Удалить учебник (SUPER_ADMIN)' })
  @ApiParam({
    name: 'id',
    description: 'Уникальный идентификатор учебника',
    type: Number,
    example: 1,
  })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.textbooksService.remove(id);
  }

  /** 📡 SSE Live рейтинг (публично) */
  @Public()
  @ApiOperation({ summary: 'Live-поток рейтинга (публично, SSE)' })
  @ApiParam({
    name: 'id',
    description: 'Уникальный идентификатор учебника',
    type: Number,
    example: 1,
  })
  @Sse('stream/:id/rating')
  streamRatings(
    @Param('id', ParseIntPipe) id: number,
  ): Observable<MessageEvent> {
    return interval(5000).pipe(
      switchMap(async () => {
        const { average, votes } = await this.ratingsService.getAverage(
          TargetType.TEXTBOOK,
          id,
        );
        return { data: { average, votes } };
      }),
    );
  }

  /** 💛 Добавить в избранное */
  @ApiOperation({ summary: 'Добавить учебник в избранное' })
  @ApiParam({
    name: 'id',
    description: 'Уникальный идентификатор учебника',
    type: Number,
    example: 1,
  })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Post(':id/favorite')
  async addToFavorites(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.favoritesService.addToFavorites(req.user.sub, {
      targetType: TargetType.TEXTBOOK,
      targetId: id,
    });
  }

  /** 💔 Удалить из избранного */
  @ApiOperation({ summary: 'Удалить учебник из избранного' })
  @ApiParam({
    name: 'id',
    description: 'Уникальный идентификатор учебника',
    type: Number,
    example: 1,
  })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Delete(':id/favorite')
  async removeFromFavorites(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.favoritesService.removeFromFavorites(req.user.sub, {
      targetType: TargetType.TEXTBOOK,
      targetId: id,
    });
  }
}
