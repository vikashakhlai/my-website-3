import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  Sse,
  MessageEvent,
  Req,
} from '@nestjs/common';
import { PersonalitiesService } from './personalities.service';
import { Era } from './personality.entity';
import { CommentsService } from 'src/comments/comments.service';
import { RatingsService } from 'src/ratings/ratings.service';
import { interval, Observable, switchMap, from, map } from 'rxjs';
import { TargetType } from 'src/common/enums/target-type.enum';

@Controller('personalities')
export class PersonalitiesController {
  constructor(
    private readonly personalitiesService: PersonalitiesService,
    private readonly commentsService: CommentsService,
    private readonly ratingsService: RatingsService,
  ) {}

  /** 🔴 SSE: поток комментариев */
  @Get('stream/:id/comments')
  @Sse()
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

  /** 🟡 SSE: поток рейтинга */
  @Get('stream/:id/rating')
  @Sse()
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

  /** ⭐ Средний рейтинг личности */
  @Get(':id/rating')
  async getRating(@Param('id', ParseIntPipe) id: number) {
    return this.ratingsService.getAverage(TargetType.PERSONALITY, id);
  }

  /** 🎲 Случайные личности */
  @Get('random')
  async getRandom(@Query('limit') limit?: string) {
    const num = Number(limit);
    return this.personalitiesService.getRandom(isNaN(num) ? 3 : num);
  }

  /** 📋 Список */
  @Get()
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '12',
    @Query('search') search?: string,
    @Query('era') era?: string,
  ) {
    const p = parseInt(page, 10) || 1;
    const l = Math.min(parseInt(limit, 10) || 12, 50);

    return this.personalitiesService.findAll(p, l, search, era as Era);
  }

  /** 👥 Современники */
  @Get(':id/contemporaries')
  async getContemporaries(@Param('id', ParseIntPipe) id: number) {
    return this.personalitiesService.getContemporaries(id);
  }

  /** 🔍 Одна личность */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.personalitiesService.findOne(id, req.user?.sub);
  }
}
