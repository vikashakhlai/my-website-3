import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { DictionaryService } from './dictionary.service';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('dictionary')
export class DictionaryController {
  constructor(private readonly dictService: DictionaryService) {}

  /** 🔍 Поиск слов по словарю (публично) */
  @Public()
  @Get('search')
  async searchDictionary(@Query('query') query: string) {
    try {
      return await this.dictService.searchDictionary(query);
    } catch (err: any) {
      throw new BadRequestException(err.message || 'Ошибка поиска');
    }
  }

  /** 🧬 Поиск по корню (публично) */
  @Public()
  @Get('by-root')
  async searchByRoot(@Query('root') root: string) {
    try {
      return await this.dictService.searchByRoot(root);
    } catch (err: any) {
      throw new BadRequestException(err.message || 'Ошибка поиска по корню');
    }
  }

  /** ✨ Автодополнение (публично) */
  @Public()
  @Get('autocomplete')
  async autocomplete(@Query('q') q: string) {
    try {
      return await this.dictService.autocomplete(q);
    } catch (err: any) {
      throw new BadRequestException(err.message || 'Ошибка автодополнения');
    }
  }
}
