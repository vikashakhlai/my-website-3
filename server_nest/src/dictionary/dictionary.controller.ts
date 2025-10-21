import { Controller, Get, Query, Res, HttpStatus } from '@nestjs/common';
import { DictionaryService } from './dictionary.service';
import type { Response } from 'express';

@Controller('dictionary')
export class DictionaryController {
  constructor(private readonly dictService: DictionaryService) {}

  @Get('search')
  async searchDictionary(@Query('query') query: string, @Res() res: Response) {
    try {
      const result = await this.dictService.searchDictionary(query);
      return res.json(result);
    } catch (err: any) {
      // можно улучшить: прокидывать HttpException с кодом
      console.error('Ошибка searchDictionary:', err);
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ error: err.message || 'Ошибка' });
    }
  }

  @Get('by-root')
  async searchByRoot(@Query('root') root: string, @Res() res: Response) {
    try {
      const result = await this.dictService.searchByRoot(root);
      return res.json(result);
    } catch (err: any) {
      console.error('Ошибка searchByRoot:', err);
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ error: err.message || 'Ошибка' });
    }
  }

  @Get('autocomplete')
  async autocomplete(@Query('q') q: string, @Res() res: Response) {
    try {
      const result = await this.dictService.autocomplete(q);
      return res.json(result);
    } catch (err: any) {
      console.error('Ошибка autocomplete:', err);
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ error: err.message || 'Ошибка' });
    }
  }
}
