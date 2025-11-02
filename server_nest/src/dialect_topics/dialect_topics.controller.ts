import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { DialectTopicsService } from './dialect_topics.service';
import { Public } from 'src/auth/decorators/public.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/roles.enum';

@Controller('dialect-topics')
export class DialectTopicsController {
  constructor(private readonly topicsService: DialectTopicsService) {}

  /** 📜 Получить все топики (публично) */
  @Public()
  @Get()
  findAll() {
    return this.topicsService.findAll();
  }

  /** 🔍 Один топик (публично) */
  @Public()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.topicsService.findOne(id);
  }

  /** ➕ Создать топик (только супер-админ) */
  @Roles(Role.SUPER_ADMIN)
  @Post()
  create(@Body() body: { name: string }) {
    return this.topicsService.create(body.name);
  }
}
