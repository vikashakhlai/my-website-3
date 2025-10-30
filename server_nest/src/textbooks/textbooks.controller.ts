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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateTextbookDto } from './dto/create-textbook.dto';
import { UpdateTextbookDto } from './dto/update-textbook.dto';

@Controller('textbooks')
export class TextbooksController {
  constructor(
    private readonly textbooksService: TextbooksService,
    private readonly ratingsService: RatingsService,
  ) {}

  /**
   * 📚 Получить список учебников (с пагинацией, фильтром и сортировкой)
   */
  @Get()
  async getAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('sort') sort?: 'asc' | 'desc',
    @Query('level') level?: string,
  ) {
    return this.textbooksService.getAll({ page, limit, sort, level });
  }

  /** 🔍 Получить учебник по ID (включая рейтинг и комментарии) */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getById(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const userId = req.user ? req.user.id : null;
    return this.textbooksService.getById(id, userId);
  }

  /** 🎲 Получить случайный учебник с PDF */
  @Get('random/one')
  getRandom() {
    return this.textbooksService.getRandom();
  }

  /** ➕ Добавить новый учебник (только для админов) */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Post()
  create(@Body() dto: CreateTextbookDto) {
    return this.textbooksService.create(dto);
  }

  /** 🔄 Обновить учебник (только для админов) */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTextbookDto,
  ) {
    return this.textbooksService.update(id, dto);
  }

  /** ❌ Удалить учебник (только для админов) */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.textbooksService.remove(id);
  }

  /** 🧩 SSE — обновление рейтинга учебников в реальном времени */
  @Get('stream/:targetType/:targetId')
  @Sse()
  streamRatings(
    @Param('targetType')
    targetType: 'book' | 'article' | 'media' | 'personality' | 'textbook',
    @Param('targetId', ParseIntPipe) targetId: number,
  ): Observable<MessageEvent> {
    return interval(5000).pipe(
      switchMap(async () => {
        const average = await this.ratingsService.getAverage(
          targetType,
          targetId,
        );
        const votes = await this.ratingsService.getVotesCount(
          targetType,
          targetId,
        );
        return { data: { average, votes } };
      }),
    );
  }
}
