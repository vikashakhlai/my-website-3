import {
  Body,
  Controller,
  Delete,
  Get,
  MessageEvent,
  Param,
  ParseIntPipe,
  Post,
  Request,
  Sse,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Observable, from, interval, mergeMap } from 'rxjs';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Public } from 'src/auth/decorators/public.decorator';
import { TargetType } from 'src/common/enums/target-type.enum';
import { CreateRatingDto } from './dto/create-rating.dto';
import { RatingsService } from './ratings.service';

@ApiTags('Ratings')
@Controller('ratings')
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @ApiOperation({ summary: 'Поставить или изменить рейтинг (1–5)' })
  @ApiBearerAuth('access-token')
  @Auth()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiResponse({
    status: 201,
    description: 'Рейтинг создан или обновлен',
    type: Object,
  })
  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async createOrUpdate(@Body() dto: CreateRatingDto, @Request() req) {
    const user = req.user;
    const result = await this.ratingsService.createOrUpdate(dto, user);
    const stats = await this.ratingsService.getAverage(
      dto.target_type,
      dto.target_id,
    );
    return { ...result, ...stats };
  }

  @Public()
  @ApiOperation({ summary: 'Получить все оценки сущности' })
  @ApiParam({ name: 'target_type', enum: TargetType })
  @ApiParam({ name: 'target_id', example: 1, description: 'ID цели' })
  @ApiResponse({ status: 200, description: 'Список оценок', type: [Object] })
  @Get(':target_type/:target_id')
  async getRatings(
    @Param('target_type') target_type: TargetType,
    @Param('target_id', ParseIntPipe) target_id: number,
  ) {
    return this.ratingsService.findByTarget(target_type, target_id);
  }

  @ApiOperation({ summary: 'Получить средний рейтинг и число голосов' })
  @ApiParam({ name: 'target_type', enum: TargetType })
  @ApiParam({ name: 'target_id', example: 1, description: 'ID цели' })
  @ApiResponse({
    status: 200,
    description: 'Средний рейтинг и количество голосов',
    type: Object,
  })
  @Get(':target_type/:target_id/average')
  async getAverage(
    @Param('target_type') target_type: TargetType,
    @Param('target_id', ParseIntPipe) target_id: number,
  ) {
    return this.ratingsService.getAverage(target_type, target_id);
  }

  @Public()
  @ApiOperation({ summary: 'Live-поток рейтинга через SSE (публично)' })
  @ApiParam({ name: 'target_type', enum: TargetType })
  @ApiParam({ name: 'target_id', example: 1, description: 'ID цели' })
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

  @ApiOperation({ summary: 'Удалить рейтинг (только свой либо SUPER_ADMIN)' })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 200, description: 'Рейтинг удален', type: Object })
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number, @Request() req) {
    await this.ratingsService.delete(id, req.user);
    return { message: 'Рейтинг удален' };
  }
}
