import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Public } from 'src/auth/decorators/public.decorator';
import { Role } from 'src/auth/roles.enum';
import { mapToDto } from 'src/common/utils/map-to-dto.util';
import { BookService } from './books.service';
import { BookResponseDto } from './dto/book-response.dto';
import { CreateBookDto } from './dto/create-book.dto';
import { RateBookDto } from './dto/rate-book.dto';
import { SearchBooksDto } from './dto/search-books.dto';
import { UpdateBookDto } from './dto/update-book.dto';

@ApiTags('Books')
@Controller('books')
export class BooksController {
  constructor(
    private readonly bookService: BookService,
    private readonly jwtService: JwtService,
  ) {}

  @Public()
  @ApiOperation({ summary: 'Получить список книг с пагинацией и фильтрами' })
  @ApiQuery({ type: SearchBooksDto })
  @ApiResponse({ status: 200, description: 'Список книг', type: Object })
  @Get()
  async getBooks(@Query() query: SearchBooksDto, @Req() req: Request) {
    const userId = this.extractUserId(req);
    const result = await this.bookService.searchBooks(query);
    return {
      ...result,
      items: result.items.map((b) => mapToDto(BookResponseDto, b)),
    };
  }

  @Public()
  @ApiOperation({ summary: 'Похожие книги' })
  @ApiParam({ name: 'id', example: 1, description: 'ID книги' })
  @ApiResponse({
    status: 200,
    description: 'Список похожих книг',
    type: [BookResponseDto],
  })
  @Get(':id/similar')
  async getSimilarBooks(@Param('id', ParseIntPipe) id: number) {
    const books = await this.bookService.getSimilarBooks(id);
    return books.map((b) => mapToDto(BookResponseDto, b));
  }

  @Public()
  @ApiOperation({ summary: 'Другие книги автора' })
  @ApiParam({ name: 'id', example: 1, description: 'ID книги' })
  @ApiResponse({
    status: 200,
    description: 'Список книг автора',
    type: [BookResponseDto],
  })
  @Get(':id/other')
  async getOtherBooksByAuthor(@Param('id', ParseIntPipe) id: number) {
    const books = await this.bookService.getOtherBooksByAuthor(id);
    return books.map((b) => mapToDto(BookResponseDto, b));
  }

  @Public()
  @ApiOperation({ summary: 'Последние добавленные книги' })
  @ApiResponse({
    status: 200,
    description: 'Список последних книг',
    type: [BookResponseDto],
  })
  @Get('latest')
  async getLatest(@Query('limit') limit?: number) {
    const books = await this.bookService.findLatest(Number(limit) || 10);
    return books.map((b) => mapToDto(BookResponseDto, b));
  }

  @Public()
  @ApiOperation({ summary: 'Получить книгу + связанные данные' })
  @ApiParam({ name: 'id', example: 1, description: 'ID книги' })
  @ApiResponse({ status: 200, description: 'Информация о книге', type: Object })
  @Get(':id')
  async findOneWithRelated(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ) {
    const userId = this.extractUserId(req);
    const result = await this.bookService.findOneWithRelated(id, userId);
    return {
      book: mapToDto(BookResponseDto, result.book),
      similarBooks: result.similarBooks.map((b) =>
        mapToDto(BookResponseDto, b),
      ),
      otherBooksByAuthor: result.otherBooksByAuthor.map((b) =>
        mapToDto(BookResponseDto, b),
      ),
    };
  }

  @Public()
  @ApiOperation({ summary: 'Получить комментарии книги' })
  @ApiParam({ name: 'id', example: 1, description: 'ID книги' })
  @ApiResponse({
    status: 200,
    description: 'Список комментариев',
    type: [Object],
  })
  @Get(':id/comments')
  async getComments(@Param('id', ParseIntPipe) id: number) {
    return await this.bookService.getComments(id);
  }

  @ApiOperation({ summary: 'Добавить комментарий к книге' })
  @ApiBearerAuth('access-token')
  @Auth()
  @ApiParam({ name: 'id', example: 1, description: 'ID книги' })
  @ApiResponse({
    status: 201,
    description: 'Комментарий добавлен',
    type: Object,
  })
  @Post(':id/comments')
  async addComment(
    @Param('id', ParseIntPipe) id: number,
    @Body('content') content: string,
    @Body('parentId') parentId: number | null,
    @Req() req: any,
  ) {
    return await this.bookService.addComment(
      id,
      req.user.id,
      content,
      parentId ?? undefined,
    );
  }

  @ApiOperation({ summary: 'Оценить книгу (1–5)' })
  @ApiBearerAuth('access-token')
  @Auth()
  @ApiParam({ name: 'id', example: 1, description: 'ID книги' })
  @ApiResponse({ status: 201, description: 'Оценка установлена', type: Object })
  @Post(':id/ratings')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async rateBook(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RateBookDto,
    @Req() req: any,
  ) {
    return await this.bookService.rateBook(id, req.user.id, dto.value);
  }

  @ApiOperation({ summary: 'Создать книгу (ADMIN+)' })
  @ApiBearerAuth('access-token')
  @Auth(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiResponse({
    status: 201,
    description: 'Книга создана',
    type: BookResponseDto,
  })
  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async create(@Body() dto: CreateBookDto) {
    const book = await this.bookService.create(dto);
    return mapToDto(BookResponseDto, book);
  }

  @ApiOperation({ summary: 'Обновить книгу (ADMIN+)' })
  @ApiBearerAuth('access-token')
  @Auth(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiParam({ name: 'id', example: 1, description: 'ID книги' })
  @ApiResponse({
    status: 200,
    description: 'Книга обновлена',
    type: BookResponseDto,
  })
  @Put(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBookDto,
  ) {
    const book = await this.bookService.update(id, dto);
    return mapToDto(BookResponseDto, book);
  }

  @ApiOperation({ summary: 'Удалить книгу (ADMIN+)' })
  @ApiBearerAuth('access-token')
  @Auth(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiParam({ name: 'id', example: 1, description: 'ID книги' })
  @ApiResponse({ status: 200, description: 'Книга удалена', type: Object })
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.bookService.remove(id);
    return { success: true };
  }

  private extractUserId(req: Request): string | undefined {
    const authHeader = req.headers['authorization'];
    if (!authHeader?.startsWith('Bearer ')) return undefined;

    try {
      const token = authHeader.split(' ')[1];
      const decoded: any = this.jwtService.verify(token);
      return decoded.sub || decoded.id;
    } catch {
      return undefined;
    }
  }
}
