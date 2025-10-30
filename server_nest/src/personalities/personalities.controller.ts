// src/personalities/personalities.controller.ts
import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  Sse,
  MessageEvent,
} from '@nestjs/common';
import { PersonalitiesService } from './personalities.service';
import { Era } from './personality.entity';
import { CommentsService } from 'src/comments/comments.service';
import { interval, Observable, switchMap, map, from } from 'rxjs';

@Controller('personalities')
export class PersonalitiesController {
  constructor(
    private readonly personalitiesService: PersonalitiesService,
    private readonly commentsService: CommentsService,
  ) {}

  /** 🔴 SSE: поток комментариев для личности */
  @Get('stream/:id/comments')
  @Sse()
  streamComments(
    @Param('id', ParseIntPipe) id: number,
  ): Observable<MessageEvent> {
    return interval(5000).pipe(
      // конвертируем Promise -> Observable
      switchMap(() =>
        from(this.commentsService.findByTarget('personality', id)),
      ),
      map((comments) => ({ data: comments }) as MessageEvent),
    );
  }

  /** сначала конкретные пути */
  @Get('random')
  async getRandom(@Query('limit') limit?: string) {
    const numLimit = Number(limit);
    return this.personalitiesService.getRandom(isNaN(numLimit) ? 3 : numLimit);
  }

  /** общий список */
  @Get()
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '12',
    @Query('search') search?: string,
    @Query('era') era?: string,
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = Math.min(parseInt(limit, 10) || 12, 50);

    return this.personalitiesService.findAll(
      pageNum,
      limitNum,
      search,
      era as Era,
    );
  }

  /** вспомогательный маршрут */
  @Get(':id/contemporaries')
  async getContemporaries(@Param('id', ParseIntPipe) id: number) {
    return this.personalitiesService.getContemporaries(id);
  }

  /** динамический маршрут в самом конце */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.personalitiesService.findOne(id);
  }
}
