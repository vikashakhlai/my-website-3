import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  ParseIntPipe,
  Param,
} from '@nestjs/common';
import { QuotesService } from './quotes.service';

@Controller('quotes')
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  // ✅ случайные цитаты для главной страницы
  @Get('random')
  async getRandomQuotes(@Query('limit') limit?: number) {
    const quotes = await this.quotesService.findRandom(limit ?? 2);

    return quotes.map((q) => ({
      id: q.id,
      text_ar: q.text_ar,
      text_ru: q.text_ru,
      personality: q.personality
        ? {
            id: q.personality.id,
            full_name: q.personality.name,
            position: q.personality.position,
          }
        : null, // 💡 безопасно обрабатываем отсутствие автора
    }));
  }

  @Get('by-personality/:id')
  async getByPersonality(@Param('id', ParseIntPipe) id: number) {
    return this.quotesService.findByPersonality(id);
  }

  // ➕ добавление цитаты
  @Post()
  async addQuote(
    @Body('text_ar') text_ar: string,
    @Body('text_ru') text_ru: string,
    @Body('personalityId') personalityId: number,
  ) {
    return this.quotesService.create(text_ar, text_ru, personalityId);
  }
}
