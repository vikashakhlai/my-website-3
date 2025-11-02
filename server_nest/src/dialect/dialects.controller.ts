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
import { Public } from 'src/auth/decorators/public.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/roles.enum';

@Controller('dialects')
export class DialectsController {
  constructor(private readonly dialectsService: DialectsService) {}

  /** 📜 Получить все диалекты (публично) */
  @Public()
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

  /** 🔍 Один диалект (публично) */
  @Public()
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Dialect> {
    return this.dialectsService.findOne(id);
  }

  /** ➕ Создать (только админ) */
  @Roles(Role.SUPER_ADMIN)
  @Post()
  async create(@Body() data: Partial<Dialect>): Promise<Dialect> {
    return this.dialectsService.create(data);
  }

  /** ♻️ Обновить (только админ) */
  @Roles(Role.SUPER_ADMIN)
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Partial<Dialect>,
  ): Promise<Dialect> {
    return this.dialectsService.update(id, data);
  }

  /** 🗑 Удалить (только админ) */
  @Roles(Role.SUPER_ADMIN)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.dialectsService.remove(id);
  }
}
