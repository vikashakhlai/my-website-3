import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  Req,
  Delete,
  Put,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BookService } from './books.service';
import { FavoritesService } from 'src/favorites/favorites.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/roles.enum';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { RateBookDto } from './dto/rate-book.dto';
import { Public } from 'src/auth/decorators/public.decorator';

@ApiTags('Books')
@Controller('books')
export class BooksController {
  constructor(
    private readonly bookService: BookService,
    private readonly jwtService: JwtService,
    private readonly favoritesService: FavoritesService,
  ) {}

  // === 🔍 Поиск и фильтрация ===
  @Public()
  @ApiOperation({ summary: 'Поиск книг с фильтрацией' })
  @Get('search')
  async search(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('tag') tag?: string,
    @Query('author') author?: string,
    @Query('title') title?: string,
  ) {
    return this.bookService.searchBooks({ page, limit, tag, author, title });
  }

  // === 📚 Все книги ===
  @Public()
  @ApiOperation({ summary: 'Получить список всех книг (публично)' })
  @Get()
  async findAll() {
    return this.bookService.findAll();
  }

  // === 📚 Похожие книги ===
  @Public()
  @ApiOperation({ summary: 'Похожие книги' })
  @Get(':id/similar')
  async getSimilarBooks(@Param('id', ParseIntPipe) id: number) {
    return this.bookService.getSimilarBooks(id);
  }

  // === 👩‍💻 Другие книги автора ===
  @Public()
  @ApiOperation({ summary: 'Другие книги автора' })
  @Get(':id/other')
  async getOtherBooksByAuthor(@Param('id', ParseIntPipe) id: number) {
    return this.bookService.getOtherBooksByAuthor(id);
  }

  // === 🕐 Последние добавленные книги ===
  @Public()
  @ApiOperation({ summary: 'Последние добавленные книги' })
  @Get('latest')
  async getLatest(@Query() query: any) {
    const safeLimit = Number(query.limit) || 10;
    return this.bookService.findLatest(safeLimit);
  }

  // === 📘 Одна книга + связанные ===
  @Public()
  @ApiOperation({ summary: 'Получить книгу + связанные данные' })
  @Get(':id')
  async findOneWithRelated(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ) {
    let userId: string | undefined;

    const authHeader = req.headers['authorization'];
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded: any = this.jwtService.verify(token);
        userId = decoded.sub || decoded.id;
      } catch {
        // токен просто игнорируется, если неверен
      }
    }

    return this.bookService.findOneWithRelated(id, userId);
  }

  // === 💬 Комментарии книги ===
  @Public()
  @ApiOperation({ summary: 'Получить комментарии книги' })
  @Get(':id/comments')
  async getComments(@Param('id', ParseIntPipe) id: number) {
    return this.bookService.getComments(id);
  }

  // === 💬 Добавить комментарий ===
  @ApiOperation({ summary: 'Добавить комментарий к книге' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Post(':id/comments')
  async addComment(
    @Param('id', ParseIntPipe) id: number,
    @Body('content') content: string,
    @Body('parentId') parentId: number | null,
    @Req() req: any,
  ) {
    const userId = req.user.sub;
    return this.bookService.addComment(id, userId, content, parentId);
  }

  // === ⭐ Поставить/обновить рейтинг ===
  @ApiOperation({ summary: 'Оценить книгу (1–5)' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Post(':id/ratings')
  async rateBook(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RateBookDto,
    @Req() req: any,
  ) {
    const userId = req.user.sub;
    return this.bookService.rateBook(id, userId, dto.value);
  }

  // === ➕ Создать книгу (ADMIN+) ===
  @ApiOperation({ summary: 'Создать книгу (ADMIN+)' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Post()
  async create(@Body() dto: CreateBookDto) {
    return this.bookService.create(dto);
  }

  // === ✏️ Обновить книгу (ADMIN+) ===
  @ApiOperation({ summary: 'Обновить книгу (ADMIN+)' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBookDto,
  ) {
    return this.bookService.update(id, dto);
  }

  // === ❌ Удалить книгу (ADMIN+) ===
  @ApiOperation({ summary: 'Удалить книгу (ADMIN+)' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.bookService.remove(id);
  }

  // === 💛 Добавить в избранное ===
  @ApiOperation({ summary: 'Добавить книгу в избранное' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Post(':id/favorite')
  async addToFavorites(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.favoritesService.addToFavorites(req.user.sub, id, 'book');
  }

  // === 💔 Удалить из избранного ===
  @ApiOperation({ summary: 'Удалить книгу из избранного' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Delete(':id/favorite')
  async removeFromFavorites(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    return this.favoritesService.removeFromFavorites(req.user.sub, id, 'book');
  }
}
