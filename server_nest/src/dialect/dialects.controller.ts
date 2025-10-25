import {
  Controller,
  Get,
  Query,
  Param,
  Post,
  Body,
  Put,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { DialectsService } from './dialects.service';
import { Dialect } from './dialect.entity';

@Controller('dialects')
export class DialectsController {
  constructor(private readonly dialectsService: DialectsService) {}

  /** 📜 Получить все диалекты (фильтрация и пагинация) */
  @Get()
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('name') name?: string,
    @Query('region') region?: string,
  ) {
    return this.dialectsService.findAll({
      page: Number(page),
      limit: Number(limit),
      name,
      region,
    });
  }

  /** 🔍 Один диалект */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Dialect> {
    return this.dialectsService.findOne(id);
  }

  /** ➕ Создать */
  @Post()
  async create(@Body() data: Partial<Dialect>): Promise<Dialect> {
    return this.dialectsService.create(data);
  }

  /** ♻️ Обновить */
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Partial<Dialect>,
  ): Promise<Dialect> {
    return this.dialectsService.update(id, data);
  }

  /** 🗑 Удалить */
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.dialectsService.remove(id);
  }
}
