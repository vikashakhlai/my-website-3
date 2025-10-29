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
import { BookService } from './books.service';
import { FavoritesService } from 'src/favorites/favorites.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { FavoriteType } from 'src/favorites/favorites.service';

@Controller('books')
export class BooksController {
  constructor(
    private readonly bookService: BookService,
    private readonly jwtService: JwtService,
    private readonly favoritesService: FavoritesService,
  ) {}

  // === 🔍 Поиск и фильтрация ===
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
  @Get()
  async findAll() {
    return this.bookService.findAll();
  }

  // === 📚 Похожие книги ===
  @Get(':id/similar')
  async getSimilarBooks(@Param('id', ParseIntPipe) id: number) {
    return this.bookService.getSimilarBooks(id);
  }

  // === 👩‍💻 Другие книги автора ===
  @Get(':id/other')
  async getOtherBooksByAuthor(@Param('id', ParseIntPipe) id: number) {
    return this.bookService.getOtherBooksByAuthor(id);
  }

  // === 🕐 Последние добавленные книги ===
  @Get('latest')
  async getLatest(@Query() query: any) {
    const safeLimit = Number(query.limit) || 10;
    return this.bookService.findLatest(safeLimit);
  }

  // === 📘 Одна книга + связанные ===
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
      } catch (err: any) {
        console.log('❌ Ошибка проверки токена:', err.message);
      }
    }

    return this.bookService.findOneWithRelated(id, userId);
  }

  // === 💬 Комментарии книги ===
  @Get(':id/comments')
  async getComments(@Param('id', ParseIntPipe) id: number) {
    return this.bookService.getComments(id);
  }

  // === 💬 Добавить комментарий ===
  @UseGuards(JwtAuthGuard)
  @Post(':id/comments')
  async addComment(
    @Param('id', ParseIntPipe) id: number,
    @Body('content') content: string,
    @Body('parentId') parentId: number | null,
    @Req() req: any,
  ) {
    const userId = req.user.sub;
    // теперь логика универсальная
    return this.bookService.addComment(id, userId, content, parentId);
  }

  // === ⭐ Получить рейтинг книги ===
  @Get(':id/ratings')
  async getRatings(@Param('id', ParseIntPipe) id: number) {
    return this.bookService.getRatings(id);
  }

  // === ⭐ Поставить/обновить рейтинг ===
  @UseGuards(JwtAuthGuard)
  @Post(':id/ratings')
  async rateBook(
    @Param('id', ParseIntPipe) id: number,
    @Body('value') value: number,
    @Req() req: any,
  ) {
    const userId = req.user.sub;
    return this.bookService.rateBook(id, userId, value);
  }

  // === ➕ Создать книгу ===
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() dto: CreateBookDto) {
    return this.bookService.create(dto);
  }

  // === ✏️ Обновить книгу ===
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBookDto,
  ) {
    return this.bookService.update(id, dto);
  }

  // === ❌ Удалить книгу ===
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.bookService.remove(id);
  }

  // === 💛 Добавить в избранное ===
  @UseGuards(JwtAuthGuard)
  @Post(':id/favorite')
  async addToFavorites(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const userId = req.user.sub;
    const type: FavoriteType = 'book';
    return this.favoritesService.addToFavorites(userId, id, type);
  }

  // === 💔 Удалить из избранного ===
  @UseGuards(JwtAuthGuard)
  @Delete(':id/favorite')
  async removeFromFavorites(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    const userId = req.user.sub;
    const type: FavoriteType = 'book';
    return this.favoritesService.removeFromFavorites(userId, id, type);
  }
}
