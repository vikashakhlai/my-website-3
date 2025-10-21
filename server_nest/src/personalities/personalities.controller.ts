import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { PersonalitiesService } from './personalities.service';
import { Era } from './personality.entity';

@Controller('personalities')
export class PersonalitiesController {
  constructor(private readonly personalitiesService: PersonalitiesService) {}

  // ✅ 1. сначала конкретные пути
  @Get('random')
  async getRandom(@Query('limit') limit?: string) {
    const numLimit = Number(limit);
    return this.personalitiesService.getRandom(isNaN(numLimit) ? 3 : numLimit);
  }

  // ✅ 2. потом общий список
  @Get()
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '12',
    @Query('search') search?: string,
    @Query('era') era?: string,
  ) {
    console.log('➡️ Получен запрос:', { page, limit, search, era });

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = Math.min(parseInt(limit, 10) || 12, 50);

    return this.personalitiesService.findAll(
      pageNum,
      limitNum,
      search,
      era as Era,
    );
  }

  // ✅ 3. потом вспомогательные (вложенные)
  @Get(':id/contemporaries')
  async getContemporaries(@Param('id', ParseIntPipe) id: number) {
    return this.personalitiesService.getContemporaries(id);
  }

  // ✅ 4. и только в конце динамический маршрут
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.personalitiesService.findOne(id);
  }
}
