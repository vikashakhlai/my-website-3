import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { BookCommentsService } from './book-comments.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('books/:bookId/comments')
export class BookCommentsController {
  constructor(private readonly commentsService: BookCommentsService) {}

  // === 📋 Получить все комментарии книги ===
  @Get()
  async getComments(@Param('bookId') bookId: string) {
    const id = Number(bookId);
    if (isNaN(id)) throw new BadRequestException('Некорректный ID книги');

    const comments = await this.commentsService.getCommentsByBookId(id);
    if (!comments.length) throw new NotFoundException('Комментарии не найдены');

    return comments;
  }

  // === 💬 Добавить комментарий (только авторизованные пользователи) ===
  @UseGuards(JwtAuthGuard)
  @Post()
  async addComment(
    @Param('bookId') bookId: string,
    @Body('content') content: string,
    @Body('parentId') parentId: number | undefined,
    @Req() req: any,
  ) {
    const id = Number(bookId);
    if (isNaN(id)) throw new BadRequestException('Некорректный ID книги');
    if (!content?.trim())
      throw new BadRequestException('Комментарий не может быть пустым');

    const userId = req.user?.id;
    if (!userId) throw new BadRequestException('Пользователь не найден');

    return this.commentsService.addComment(
      id,
      userId,
      content.trim(),
      parentId,
    );
  }
}
