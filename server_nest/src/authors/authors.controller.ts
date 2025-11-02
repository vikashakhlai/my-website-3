import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Body,
  Put,
  Delete,
} from '@nestjs/common';
import { AuthorsService } from './authors.service';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/roles.enum';
import { Public } from 'src/auth/decorators/public.decorator';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Authors')
@Controller('authors')
export class AuthorsController {
  constructor(private readonly authorsService: AuthorsService) {}

  // ==================== Публичный ====================

  @Public()
  @ApiOperation({ summary: 'Получить автора с его книгами (публично)' })
  @Get(':id')
  async getAuthor(@Param('id', ParseIntPipe) id: number) {
    return this.authorsService.getAuthorById(id);
  }

  @Public()
  @ApiOperation({ summary: 'Получить список всех авторов (публично)' })
  @Get()
  async getAllAuthors() {
    return this.authorsService.getAllAuthors();
  }

  // ==================== ADMIN+ ====================

  @ApiOperation({ summary: 'Создать автора (ADMIN, SUPER_ADMIN)' })
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Post()
  async create(@Body() dto: CreateAuthorDto) {
    return this.authorsService.createAuthor(dto);
  }

  @ApiOperation({ summary: 'Обновить данные автора (ADMIN, SUPER_ADMIN)' })
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAuthorDto,
  ) {
    return this.authorsService.updateAuthor(id, dto);
  }

  @ApiOperation({ summary: 'Удалить автора (ADMIN, SUPER_ADMIN)' })
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.authorsService.deleteAuthor(id);
  }
}
