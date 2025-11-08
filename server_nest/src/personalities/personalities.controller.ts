import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  Sse,
  MessageEvent,
  Req,
  UseGuards,
  Body,
  Delete,
  Post,
  Put,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { interval, Observable, switchMap, from, map } from 'rxjs';

import { PersonalitiesService } from './personalities.service';
import { CommentsService } from 'src/comments/comments.service';
import { RatingsService } from 'src/ratings/ratings.service';

import { Era } from './personality.entity';
import { TargetType } from 'src/common/enums/target-type.enum';
import { Public } from 'src/auth/decorators/public.decorator';
import { OptionalJwtAuthGuard } from 'src/auth/guards/optional-jwt.guard';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiSecurity,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { PersonalityResponseDto } from './dto/personality-response.dto';
import { mapToDto } from 'src/common/utils/map-to-dto.util';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Role } from 'src/auth/roles.enum';
import { ApiErrorResponses } from 'src/common/decorators/api-error-responses.decorator';
import {
  CreatePersonalityDto,
  UpdatePersonalityDto,
} from './dto/create-personality.dto';

@Controller('personalities')
export class PersonalitiesController {
  constructor(
    private readonly personalitiesService: PersonalitiesService,
    private readonly commentsService: CommentsService,
    private readonly ratingsService: RatingsService,
  ) {}

  /** 🔴 SSE: поток комментариев (публично) */
  @ApiOperation({
    summary: 'SSE поток комментариев',
    description:
      'Server-Sent Events поток для получения обновлений комментариев в реальном времени. Публичный доступ.',
  })
  @ApiParam({
    name: 'id',
    description: 'Уникальный идентификатор личности',
    type: Number,
    example: 1,
  })
  @Public()
  @Sse('stream/:id/comments')
  streamComments(
    @Param('id', ParseIntPipe) id: number,
  ): Observable<MessageEvent> {
    return interval(5000).pipe(
      switchMap(() =>
        from(this.commentsService.findByTarget(TargetType.PERSONALITY, id)),
      ),
      map((comments) => ({ data: comments }) as MessageEvent),
    );
  }

  /** 🟡 SSE: live рейтинг (публично) */
  @ApiOperation({
    summary: 'SSE поток рейтинга',
    description:
      'Server-Sent Events поток для получения обновлений рейтинга в реальном времени. Публичный доступ.',
  })
  @ApiParam({
    name: 'id',
    description: 'Уникальный идентификатор личности',
    type: Number,
    example: 1,
  })
  @Public()
  @Sse('stream/:id/rating')
  streamRating(
    @Param('id', ParseIntPipe) id: number,
  ): Observable<MessageEvent> {
    return interval(5000).pipe(
      switchMap(() =>
        from(this.ratingsService.getAverage(TargetType.PERSONALITY, id)),
      ),
      map((data) => ({ data }) as MessageEvent),
    );
  }

  /** ⭐ Средний рейтинг (публично) */
  @ApiOperation({
    summary: 'Получить средний рейтинг личности',
    description:
      'Возвращает средний рейтинг и количество оценок для личности. Публичный доступ.',
  })
  @ApiParam({
    name: 'id',
    description: 'Уникальный идентификатор личности',
    type: Number,
    example: 1,
  })
  @ApiOkResponse({
    description: 'Рейтинг успешно получен',
  })
  @Public()
  @Get(':id/rating')
  async getRating(@Param('id', ParseIntPipe) id: number) {
    return this.ratingsService.getAverage(TargetType.PERSONALITY, id);
  }

  /** 🎲 Случайные личности (публично) */
  @ApiOperation({
    summary: 'Получить случайные личности',
    description:
      'Возвращает случайные личности для главной страницы. Публичный доступ.',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Количество личностей',
    example: 3,
  })
  @ApiOkResponse({
    description: 'Случайные личности успешно получены',
    type: [PersonalityResponseDto],
  })
  @Public()
  @Get('random')
  async getRandom(@Query('limit') limit?: string) {
    const num = Number(limit);
    const personalities = await this.personalitiesService.getRandom(
      isNaN(num) ? 3 : num,
    );
    return mapToDto(PersonalityResponseDto, personalities);
  }

  /** 📋 Список личностей с пагинацией (публично) */
  @ApiOperation({
    summary: 'Получить список личностей',
    description:
      'Возвращает список личностей с пагинацией, поиском и фильтрацией по эпохе. Публичный доступ.',
  })
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
    example: 12,
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Поисковый запрос',
    example: 'Аль-Фараби',
  })
  @ApiQuery({
    name: 'era',
    required: false,
    enum: Era,
    description: 'Фильтр по исторической эпохе',
    example: Era.ABBASID,
  })
  @ApiOkResponse({
    description: 'Список личностей успешно получен',
  })
  @Public()
  @Get()
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '12',
    @Query('search') search?: string,
    @Query('era') era?: string,
    @Req() req?: any,
  ) {
    const userId = req?.user?.sub ?? null;
    return this.personalitiesService.findAll(
      Number(page) || 1,
      Math.min(Number(limit) || 12, 50),
      search,
      era as Era,
      userId,
    );
  }

  /** 👥 Современники (публично) */
  @ApiOperation({
    summary: 'Получить современников личности',
    description:
      'Возвращает список личностей, живших в то же время, что и указанная личность. Публичный доступ.',
  })
  @ApiParam({
    name: 'id',
    description: 'Уникальный идентификатор личности',
    type: Number,
    example: 1,
  })
  @ApiOkResponse({
    description: 'Современники успешно получены',
    type: [PersonalityResponseDto],
  })
  @Public()
  @Get(':id/contemporaries')
  async getContemporaries(@Param('id', ParseIntPipe) id: number) {
    const contemporaries =
      await this.personalitiesService.getContemporaries(id);
    return mapToDto(PersonalityResponseDto, contemporaries);
  }

  /** 🔍 Одна личность (публично, но учитывает авторизацию для рейтинга/избранного) */
  @ApiOperation({
    summary: 'Получить информацию о личности',
    description:
      'Возвращает полную информацию о личности, включая биографию, книги, статьи, цитаты, рейтинги и комментарии. Публичный эндпоинт, не требует аутентификации. If the request includes a valid JWT token, the response will also include `userRating` and `isFavorite`.',
  })
  @ApiParam({
    name: 'id',
    description: 'Уникальный идентификатор личности',
    type: Number,
    example: 1,
  })
  @ApiOkResponse({
    description: 'Информация о личности успешно получена',
    type: PersonalityResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Личность не найдена',
  })
  @UseGuards(OptionalJwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const userId = req.user?.sub ?? null;
    const personality = await this.personalitiesService.findOne(id, userId);
    return mapToDto(PersonalityResponseDto, personality);
  }

  /** ➕ Создать личность (ADMIN, SUPER_ADMIN) */
  @ApiOperation({
    summary: 'Создать новую личность',
    description:
      'Создает новую личность в системе. Доступно только для пользователей с ролями ADMIN или SUPER_ADMIN. Требуется JWT токен в заголовке Authorization.',
  })
  @ApiCreatedResponse({
    description: 'Личность успешно создана',
    type: PersonalityResponseDto,
  })
  @ApiErrorResponses({ include404: false })
  @ApiBearerAuth('access-token')
  @ApiSecurity('access-token')
  @Auth(Role.ADMIN, Role.SUPER_ADMIN)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @Post()
  async create(@Body() dto: CreatePersonalityDto) {
    const personality = await this.personalitiesService.create(dto);
    return mapToDto(PersonalityResponseDto, personality);
  }

  /** ✏️ Обновить личность (ADMIN, SUPER_ADMIN) */
  @ApiOperation({
    summary: 'Обновить информацию о личности',
    description:
      'Обновляет информацию о личности. Доступно только для пользователей с ролями ADMIN или SUPER_ADMIN. Требуется JWT токен в заголовке Authorization.',
  })
  @ApiParam({
    name: 'id',
    description: 'Уникальный идентификатор личности',
    type: Number,
    example: 1,
  })
  @ApiOkResponse({
    description: 'Личность успешно обновлена',
    type: PersonalityResponseDto,
  })
  @ApiErrorResponses()
  @ApiBearerAuth('access-token')
  @ApiSecurity('access-token')
  @Auth(Role.ADMIN, Role.SUPER_ADMIN)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePersonalityDto,
  ) {
    const personality = await this.personalitiesService.update(id, dto);
    return mapToDto(PersonalityResponseDto, personality);
  }

  /** 🗑 Удалить личность (ADMIN, SUPER_ADMIN) */
  @ApiOperation({
    summary: 'Удалить личность',
    description:
      'Удаляет личность из системы. Доступно только для пользователей с ролями ADMIN или SUPER_ADMIN. Требуется JWT токен в заголовке Authorization.',
  })
  @ApiParam({
    name: 'id',
    description: 'Уникальный идентификатор личности',
    type: Number,
    example: 1,
  })
  @ApiOkResponse({
    description: 'Личность успешно удалена',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Личность #1 удалена',
        },
      },
    },
  })
  @ApiErrorResponses({ include400: false })
  @ApiBearerAuth('access-token')
  @ApiSecurity('access-token')
  @Auth(Role.ADMIN, Role.SUPER_ADMIN)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.personalitiesService.remove(id);
  }
}
