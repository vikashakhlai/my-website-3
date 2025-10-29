import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  ParseIntPipe,
  Sse,
  MessageEvent,
} from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Observable, from, interval, map, mergeMap } from 'rxjs';

@Controller('ratings')
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  // --- Создать или обновить рейтинг ---
  @UseGuards(JwtAuthGuard)
  @Post()
  async createOrUpdate(@Body() dto: CreateRatingDto, @Request() req) {
    const user = req.user;
    const result = await this.ratingsService.createOrUpdate(dto, user);
    // Возвращаем сразу обновлённую статистику
    const stats = await this.ratingsService.getAverage(
      dto.target_type,
      dto.target_id,
    );
    return { ...result, ...stats };
  }

  // --- Получить все рейтинги по сущности ---
  @Get(':target_type/:target_id')
  async getRatings(
    @Param('target_type') target_type: string,
    @Param('target_id', ParseIntPipe) target_id: number,
  ) {
    return this.ratingsService.findByTarget(
      target_type as 'book' | 'article' | 'media' | 'personality' | 'textbook',
      target_id,
    );
  }

  // --- Получить средний рейтинг и количество голосов ---
  @Get(':target_type/:target_id/average')
  async getAverage(
    @Param('target_type') target_type: string,
    @Param('target_id', ParseIntPipe) target_id: number,
  ) {
    return this.ratingsService.getAverage(
      target_type as 'book' | 'article' | 'media' | 'personality' | 'textbook',
      target_id,
    );
  }

  // --- Live-стрим обновлений среднего рейтинга через SSE ---
  @Sse('stream/:target_type/:target_id')
  streamAverage(
    @Param('target_type') target_type: string,
    @Param('target_id', ParseIntPipe) target_id: number,
  ): Observable<MessageEvent> {
    // ⚡ Каждые 5 секунд шлём обновлённую статистику
    return interval(5000).pipe(
      mergeMap(() =>
        from(
          this.ratingsService
            .getAverage(
              target_type as
                | 'book'
                | 'article'
                | 'media'
                | 'personality'
                | 'textbook',
              target_id,
            )
            .then((stats) => ({ data: stats }) as MessageEvent),
        ),
      ),
    );
  }

  // --- Удалить рейтинг (только автор или админ) ---
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const user = req.user;
    return this.ratingsService.delete(id, user);
  }
}
