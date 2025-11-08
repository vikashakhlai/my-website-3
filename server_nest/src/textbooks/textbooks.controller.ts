import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  MessageEvent,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Request,
  Sse,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { interval, Observable, switchMap } from 'rxjs';

import { FavoritesService } from 'src/favorites/favorites.service';
import { RatingsService } from 'src/ratings/ratings.service';
import { TextbooksService } from './textbooks.service';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Public } from 'src/auth/decorators/public.decorator';
import { OptionalJwtAuthGuard } from 'src/auth/guards/optional-jwt.guard';
import { Role } from 'src/auth/roles.enum';
import { TargetType } from 'src/common/enums/target-type.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateTextbookDto } from './dto/create-textbook.dto';
import { UpdateTextbookDto } from './dto/update-textbook.dto';

@ApiTags('Textbooks')
@Controller('textbooks')
export class TextbooksController {
  constructor(
    private readonly textbooksService: TextbooksService,
    private readonly ratingsService: RatingsService,
    private readonly favoritesService: FavoritesService,
  ) {}

  @Public()
  @ApiOperation({ summary: 'Список учебников (публично)' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Номер страницы (по умолчанию 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Количество на странице (по умолчанию 10, максимум 100)',
    example: 10,
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    enum: ['asc', 'desc'],
    description: 'Сортировка по ID (asc/desc)',
    example: 'desc',
  })
  @ApiQuery({
    name: 'level',
    required: false,
    type: String,
    description: 'Фильтр по уровню (Basic, Intermediate, Advanced)',
    example: 'Advanced',
  })
  @ApiResponse({
    status: 200,
    description: 'Список учебников с пагинацией и статистикой',
    type: Object,
  })
  @Get()
  async getAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('sort') sort?: 'asc' | 'desc',
    @Query('level') level?: string,
  ) {
    return this.textbooksService.getAll({ page, limit, sort, level });
  }

  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Получить учебник (публично, с canDownload)' })
  @ApiResponse({
    status: 200,
    description: 'Информация о учебнике с рейтингом и возможностью скачивания',
    type: Object,
  })
  @Get(':id')
  async getPublic(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    const userId = req.user?.id ?? null;
    return this.textbooksService.getPublicView(id, userId);
  }

  @ApiOperation({ summary: 'Скачать учебник (только авторизованные)' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Ссылка на скачивание PDF',
    type: Object,
  })
  @Get(':id/download')
  async download(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.textbooksService.getDownloadFile(id, req.user.id);
  }

  @Public()
  @ApiOperation({ summary: 'Случайный учебник (публично)' })
  @ApiResponse({
    status: 200,
    description: 'Случайный учебник с PDF',
    type: Object,
  })
  @Get('random/one')
  getRandom() {
    return this.textbooksService.getRandom();
  }

  @ApiOperation({ summary: 'Создать новый учебник (SUPER_ADMIN)' })
  @ApiBearerAuth('access-token')
  @Auth(Role.SUPER_ADMIN)
  @ApiResponse({ status: 201, description: 'Учебник создан', type: Object })
  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  create(@Body() dto: CreateTextbookDto) {
    return this.textbooksService.create(dto);
  }

  @ApiOperation({ summary: 'Обновить учебник (SUPER_ADMIN)' })
  @ApiBearerAuth('access-token')
  @Auth(Role.SUPER_ADMIN)
  @ApiResponse({ status: 200, description: 'Учебник обновлен', type: Object })
  @Put(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTextbookDto,
  ) {
    return this.textbooksService.update(id, dto);
  }

  @ApiOperation({ summary: 'Удалить учебник (SUPER_ADMIN)' })
  @ApiBearerAuth('access-token')
  @Auth(Role.SUPER_ADMIN)
  @ApiResponse({ status: 200, description: 'Учебник удален', type: Object })
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.textbooksService.remove(id);
  }

  @Public()
  @ApiOperation({ summary: 'Live-поток рейтинга (публично, SSE)' })
  @ApiResponse({ status: 200, description: 'SSE поток с рейтингом' })
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

  @ApiOperation({ summary: 'Добавить учебник в избранное' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({
    status: 201,
    description: 'Добавлено в избранное',
    type: Object,
  })
  @Post(':id/favorite')
  async addToFavorites(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.favoritesService.addToFavorites(req.user.id, {
      targetType: TargetType.TEXTBOOK,
      targetId: id,
    });
  }

  @ApiOperation({ summary: 'Удалить учебник из избранного' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Удалено из избранного',
    type: Object,
  })
  @Delete(':id/favorite')
  async removeFromFavorites(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.favoritesService.removeFromFavorites(req.user.id, {
      targetType: TargetType.TEXTBOOK,
      targetId: id,
    });
  }
}
