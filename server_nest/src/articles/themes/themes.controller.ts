import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/auth/decorators/public.decorator';
import { ThemesService } from './themes.service';

@ApiTags('Themes')
@Controller('themes')
export class ThemesController {
  constructor(private readonly themesService: ThemesService) {}

  @Public()
  @ApiOperation({ summary: 'Получить список всех тем (публично)' })
  @Get()
  findAll() {
    return this.themesService.findAll();
  }

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
