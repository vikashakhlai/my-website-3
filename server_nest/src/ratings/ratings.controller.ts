import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Request,
  ParseIntPipe,
  Sse,
  MessageEvent,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RatingsService } from './ratings.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import {
  RatingResponseDto,
  RatingStatsDto,
} from './dto/rating-response.dto';
import {
  Observable,
  interval,
  switchMap,
  catchError,
  of,
  EMPTY,
} from 'rxjs';
import {
  ApiOperation,
  ApiTags,
  ApiParam,
  ApiBearerAuth,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiResponse,
} from '@nestjs/swagger';
import { TargetType } from 'src/common/enums/target-type.enum';
import { Public } from 'src/auth/decorators/public.decorator';
import { mapToDto } from 'src/common/utils/map-to-dto.util';

@ApiTags('Ratings')
@Controller('ratings')
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  /** ⭐ Создать / обновить рейтинг (1–5) */
  @ApiOperation({
    summary: 'Поставить или изменить рейтинг (1–5)',
    description:
      'Создаёт новый рейтинг или обновляет существующий для авторизованного пользователя. ' +
      'Ограничение: 5 запросов в минуту на пользователя.',
  })
  @ApiBearerAuth('access-token')
  @ApiCreatedResponse({
    description: 'Рейтинг успешно создан или обновлён',
    type: RatingResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Некорректные данные запроса (неверный тип, ID или значение рейтинга)',
  })
  @ApiUnauthorizedResponse({
    description: 'Требуется авторизация для создания рейтинга',
  })
  @Throttle({ default: { limit: 5, ttl: 60_000 } }) // 5 запросов в минуту
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @Post()
  async createOrUpdate(@Body() dto: CreateRatingDto, @Request() req) {
    const user = req.user;
    const result = await this.ratingsService.createOrUpdate(dto, user);
    const stats = await this.ratingsService.getAverage(
      dto.target_type,
      dto.target_id,
    );
    return {
      ...mapToDto(RatingResponseDto, result),
      ...mapToDto(RatingStatsDto, stats),
    };
  }

  /** 📋 Получить список всех оценок сущности */
  @Public()
  @ApiOperation({
    summary: 'Получить все оценки сущности',
    description: 'Возвращает список всех рейтингов для указанной сущности. Публичный эндпоинт.',
  })
  @ApiParam({
    name: 'target_type',
    enum: TargetType,
    description: 'Тип сущности (article, book, media, textbook, personality)',
  })
  @ApiParam({
    name: 'target_id',
    type: Number,
    description: 'Идентификатор сущности',
  })
  @ApiOkResponse({
    description: 'Список рейтингов',
    type: [RatingResponseDto],
  })
  @Get(':target_type/:target_id')
  async getRatings(
    @Param('target_type') target_type: TargetType,
    @Param('target_id', ParseIntPipe) target_id: number,
  ) {
    const ratings = await this.ratingsService.findByTarget(
      target_type,
      target_id,
    );
    return ratings.map((r) => mapToDto(RatingResponseDto, r));
  }

  /** 📊 Средний рейтинг + количество голосов */
  @Public()
  @ApiOperation({
    summary: 'Получить средний рейтинг и число голосов',
    description:
      'Возвращает статистику рейтинга: среднее значение (округлённое до 2 знаков) и количество оценок. Публичный эндпоинт.',
  })
  @ApiParam({
    name: 'target_type',
    enum: TargetType,
    description: 'Тип сущности (article, book, media, textbook, personality)',
  })
  @ApiParam({
    name: 'target_id',
    type: Number,
    description: 'Идентификатор сущности',
  })
  @ApiOkResponse({
    description: 'Статистика рейтинга',
    type: RatingStatsDto,
  })
  @Get(':target_type/:target_id/average')
  async getAverage(
    @Param('target_type') target_type: TargetType,
    @Param('target_id', ParseIntPipe) target_id: number,
  ) {
    return mapToDto(
      RatingStatsDto,
      await this.ratingsService.getAverage(target_type, target_id),
    );
  }

  /** 🔁 Live-обновление рейтинга через SSE */
  @Public()
  @ApiOperation({
    summary: 'Live-поток рейтинга через SSE (публично)',
    description:
      'Подписка на обновления рейтинга в реальном времени через Server-Sent Events. ' +
      'Отправляет статистику рейтинга каждые 5 секунд. Публичный эндпоинт, не требует авторизации. ' +
      'Автоматически переподключается при разрыве соединения.',
  })
  @ApiParam({
    name: 'target_type',
    enum: TargetType,
    description: 'Тип сущности (article, book, media, textbook, personality)',
  })
  @ApiParam({
    name: 'target_id',
    type: Number,
    description: 'Идентификатор сущности',
  })
  @ApiResponse({
    status: 200,
    description: 'SSE поток обновлений рейтинга',
    content: {
      'text/event-stream': {
        schema: {
          type: 'string',
          example: 'data: {"average":4.5,"votes":120}\n\n',
        },
      },
    },
  })
  @Sse('stream/:target_type/:target_id')
  streamAverage(
    @Param('target_type') target_type: TargetType,
    @Param('target_id', ParseIntPipe) target_id: number,
  ): Observable<MessageEvent> {
    // Используем switchMap вместо mergeMap для отмены предыдущих запросов
    // и catchError для обработки ошибок без разрыва потока
    return interval(5000).pipe(
      switchMap(() =>
        from(
          this.ratingsService.getAverage(target_type, target_id).catch((err) => {
            // Логируем ошибку, но не прерываем поток
            if (process.env.NODE_ENV === 'development') {
              console.error('SSE rating error:', err);
            }
            return { average: null, votes: 0 };
          }),
        ),
      ),
      switchMap((stats) => {
        const dto = mapToDto(RatingStatsDto, stats);
        return of({ data: dto } as MessageEvent);
      }),
      catchError((err) => {
        // В случае критической ошибки отправляем пустое событие и продолжаем
        if (process.env.NODE_ENV === 'development') {
          console.error('SSE rating stream error:', err);
        }
        return EMPTY;
      }),
    );
  }

  /** ❌ Удалить рейтинг (только свой, SUPER_ADMIN — любой) */
  @ApiOperation({
    summary: 'Удалить рейтинг (только свой либо SUPER_ADMIN)',
    description:
      'Удаляет рейтинг. Пользователь может удалить только свой рейтинг. ' +
      'SUPER_ADMIN может удалить любой рейтинг.',
  })
  @ApiBearerAuth('access-token')
  @ApiOkResponse({
    description: 'Рейтинг успешно удалён',
  })
  @ApiUnauthorizedResponse({
    description: 'Требуется авторизация',
  })
  @ApiNotFoundResponse({
    description: 'Рейтинг не найден',
  })
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number, @Request() req) {
    await this.ratingsService.delete(id, req.user);
    return { message: 'Рейтинг успешно удалён' };
  }
}

