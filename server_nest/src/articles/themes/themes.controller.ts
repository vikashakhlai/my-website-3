import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/auth/decorators/public.decorator';
import { mapToDto } from 'src/common/utils/map-to-dto.util';
import { ThemeResponseDto } from './dto/theme-response.dto';
import { ThemesService } from './themes.service';

@ApiTags('Themes')
@Controller('themes')
export class ThemesController {
  constructor(private readonly themesService: ThemesService) {}

  @Public()
  @ApiOperation({ summary: 'Получить список всех тем (публично)' })
  @ApiResponse({
    status: 200,
    description: 'Список тем',
    type: [ThemeResponseDto],
  })
  @Get()
  async findAll() {
    const themes = await this.themesService.findAll();
    return themes.map((t) => mapToDto(ThemeResponseDto, t));
  }

  @Public()
  @ApiOperation({ summary: 'Получить тему по slug (публично)' })
  @ApiParam({
    name: 'slug',
    example: 'literature-classics',
    description: 'URL slug темы',
  })
  @ApiResponse({
    status: 200,
    description: 'Информация о теме',
    type: ThemeResponseDto,
  })
  @Get(':slug')
  async findOne(@Param('slug') slug: string) {
    const theme = await this.themesService.findBySlug(slug);
    if (!theme) {
      throw new NotFoundException('Тема не найдена');
    }
    return mapToDto(ThemeResponseDto, theme);
  }
}
