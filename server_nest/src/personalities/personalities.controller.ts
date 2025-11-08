import {
  Controller,
  Get,
  MessageEvent,
  Param,
  ParseIntPipe,
  Query,
  Req,
  Sse,
} from '@nestjs/common';
import { from, interval, map, Observable, switchMap } from 'rxjs';

import { CommentsService } from 'src/comments/comments.service';
import { RatingsService } from 'src/ratings/ratings.service';
import { PersonalitiesService } from './personalities.service';

import { Public } from 'src/auth/decorators/public.decorator';
import { TargetType } from 'src/common/enums/target-type.enum';
import { Era } from './personality.entity';

@Controller('personalities')
export class PersonalitiesController {
  constructor(
    private readonly personalitiesService: PersonalitiesService,
    private readonly commentsService: CommentsService,
    private readonly ratingsService: RatingsService,
  ) {}

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

  @Public()
  @Get(':id/rating')
  async getRating(@Param('id', ParseIntPipe) id: number) {
    return this.ratingsService.getAverage(TargetType.PERSONALITY, id);
  }

  @Public()
  @Get('random')
  async getRandom(@Query('limit') limit?: string) {
    const num = Number(limit);
    return this.personalitiesService.getRandom(isNaN(num) ? 3 : num);
  }

  @Public()
  @Get()
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '12',
    @Query('search') search?: string,
    @Query('era') era?: string,
    @Req() req?: any,
  ) {
    const userId = req?.user?.id ?? null;
    return this.personalitiesService.findAll(
      Number(page) || 1,
      Math.min(Number(limit) || 12, 50),
      search,
      era as Era,
      userId,
    );
  }

  @Public()
  @Get(':id/contemporaries')
  async getContemporaries(@Param('id', ParseIntPipe) id: number) {
    return this.personalitiesService.getContemporaries(id);
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.personalitiesService.findOne(id, req.user?.id ?? null);
  }
}
