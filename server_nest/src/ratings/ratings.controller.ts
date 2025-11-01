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
import { Throttle } from '@nestjs/throttler';
import { RatingsService } from './ratings.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Observable, interval, mergeMap, from } from 'rxjs';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiParam,
} from '@nestjs/swagger';
import { TargetType } from 'src/common/enums/target-type.enum';
import { Public } from 'src/auth/decorators/public.decorator';

@ApiTags('Ratings')
@Controller('ratings')
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  /** Создать / обновить рейтинг */
  @ApiOperation({ summary: 'Поставить или изменить рейтинг (1–5)' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post()
  async createOrUpdate(@Body() dto: CreateRatingDto, @Request() req) {
    const user = req.user;
    const result = await this.ratingsService.createOrUpdate(dto, user);
    const stats = await this.ratingsService.getAverage(
      dto.target_type,
      dto.target_id,
    );
    return { ...result, ...stats };
  }

  /** Получить список всех оценок сущности */
  @Public()
  @ApiOperation({ summary: 'Получить все оценки сущности' })
  @ApiParam({ name: 'target_type', enum: TargetType })
  @Get(':target_type/:target_id')
  async getRatings(
    @Param('target_type') target_type: TargetType,
    @Param('target_id', ParseIntPipe) target_id: number,
  ) {
    return this.ratingsService.findByTarget(target_type, target_id);
  }

  /** Средний рейтинг */
  @ApiOperation({ summary: 'Получить средний рейтинг и число голосов' })
  @ApiParam({ name: 'target_type', enum: TargetType })
  @Get(':target_type/:target_id/average')
  async getAverage(
    @Param('target_type') target_type: TargetType,
    @Param('target_id', ParseIntPipe) target_id: number,
  ) {
    return this.ratingsService.getAverage(target_type, target_id);
  }

  /** SSE стрим лайв-рейтинга */
  @Public()
  @ApiOperation({ summary: 'Live-поток рейтинга через SSE (публично)' })
  @Sse('stream/:target_type/:target_id')
  streamAverage(
    @Param('target_type') target_type: TargetType,
    @Param('target_id', ParseIntPipe) target_id: number,
  ): Observable<MessageEvent> {
    return interval(5000).pipe(
      mergeMap(() =>
        from(
          this.ratingsService
            .getAverage(target_type, target_id)
            .then((stats) => ({ data: stats }) as MessageEvent),
        ),
      ),
    );
  }

  /** Удалить рейтинг (только свой, SUPER_ADMIN — любой) */
  @ApiOperation({ summary: 'Удалить рейтинг (только свой либо SUPER_ADMIN)' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.ratingsService.delete(id, req.user);
  }
}
