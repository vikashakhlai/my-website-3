import { Controller, Get, Param } from '@nestjs/common';
import { ThemesService } from './themes.service';
import { Public } from 'src/auth/decorators/public.decorator';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';

@ApiTags('Themes')
@Controller('themes')
export class ThemesController {
  constructor(private readonly themesService: ThemesService) {}

  /** 📋 Все темы (публично) */
  @Public()
  @ApiOperation({ summary: 'Получить список всех тем (публично)' })
  @Get()
  findAll() {
    return this.themesService.findAll();
  }

  /** 🔍 Тема по slug (публично) */
  @Public()
  @ApiOperation({ summary: 'Получить тему по slug (публично)' })
  @ApiParam({
    name: 'slug',
    example: 'literature-classics',
    description: 'URL slug темы',
  })
  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.themesService.findBySlug(slug);
  }
}
