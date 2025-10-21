import { Controller, Get, Param } from '@nestjs/common';
import { ThemesService } from './themes.service';

@Controller('themes')
export class ThemesController {
  constructor(private readonly themesService: ThemesService) {}

  // 📋 Все темы
  @Get()
  findAll() {
    return this.themesService.findAll();
  }

  // 🔍 Тема по slug
  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.themesService.findBySlug(slug);
  }
}
