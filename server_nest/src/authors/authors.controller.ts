import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Body,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { AuthorsService } from './authors.service';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/roles.enum';
import { Public } from 'src/auth/decorators/public.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Authors')
@Controller('authors')
export class AuthorsController {
  constructor(private readonly authorsService: AuthorsService) {}

  // ✅ Публичный доступ
  @Public()
  @ApiOperation({ summary: 'Получить автора с книгами' })
  @Get(':id')
  async getAuthor(@Param('id', ParseIntPipe) id: number) {
    return this.authorsService.getAuthorById(id);
  }

  // ✅ Только ADMIN+
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Создать нового автора (ADMIN+)' })
  @Post()
  async create(@Body() dto: CreateAuthorDto) {
    return this.authorsService.createAuthor(dto);
  }

  // ✅ Только ADMIN+
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Обновить данные автора (ADMIN+)' })
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAuthorDto,
  ) {
    return this.authorsService.updateAuthor(id, dto);
  }

  // ✅ Только ADMIN+
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Удалить автора (ADMIN+)' })
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.authorsService.deleteAuthor(id);
  }
}
