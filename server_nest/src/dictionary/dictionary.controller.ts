import {
  Controller,
  Get,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/auth/decorators/public.decorator';
import { DictionaryService } from './dictionary.service';
import { AutocompleteDto } from './dto/autocomplete.dto';
import {
  AutocompleteResponseDto,
  SearchByRootResponseDto,
  SearchDictionaryResponseDto,
} from './dto/dictionary-response.dto';
import { SearchByRootDto } from './dto/search-by-root.dto';
import { SearchDictionaryDto } from './dto/search-dictionary.dto';

@ApiTags('Dictionary')
@Controller('dictionary')
export class DictionaryController {
  constructor(private readonly dictService: DictionaryService) {}

  @Public()
  @ApiOperation({ summary: 'Поиск слов по словарю (арабский/русский)' })
  @ApiQuery({ name: 'query', example: 'كتب', description: 'Поисковый запрос' })
  @ApiResponse({
    status: 200,
    description: 'Результаты поиска',
    type: SearchDictionaryResponseDto,
  })
  @Get('search')
  @UsePipes(new ValidationPipe({ transform: true }))
  async searchDictionary(@Query() dto: SearchDictionaryDto) {
    return this.dictService.searchDictionary(dto.query);
  }

  @Public()
  @ApiOperation({ summary: 'Поиск слов по корню' })
  @ApiQuery({ name: 'root', example: 'كتب', description: 'Корень слова' })
  @ApiResponse({
    status: 200,
    description: 'Слова по корню',
    type: SearchByRootResponseDto,
  })
  @Get('by-root')
  @UsePipes(new ValidationPipe({ transform: true }))
  async searchByRoot(@Query() dto: SearchByRootDto) {
    return this.dictService.searchByRoot(dto.root);
  }

  @Public()
  @ApiOperation({ summary: 'Автодополнение для слова' })
  @ApiQuery({ name: 'q', example: 'كت', description: 'Часть слова' })
  @ApiResponse({
    status: 200,
    description: 'Варианты автодополнения',
    type: AutocompleteResponseDto,
  })
  @Get('autocomplete')
  @UsePipes(new ValidationPipe({ transform: true }))
  async autocomplete(@Query() dto: AutocompleteDto) {
    return this.dictService.autocomplete(dto.q);
  }
}
