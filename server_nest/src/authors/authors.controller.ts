import { Controller, Get, Query } from '@nestjs/common';
import { AuthorsService } from './authors.service';

@Controller('authors')
export class AuthorsController {
  constructor(private readonly authorsService: AuthorsService) {}

  // 🔹 Получить всех авторов
  @Get()
  async getAll(@Query('search') search?: string) {
    if (search) {
      return this.authorsService.searchByName(search);
    }
    return this.authorsService.findAll();
  }
}
