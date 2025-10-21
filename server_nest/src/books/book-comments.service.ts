import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BookComment } from './book-comment.entity';
import { Book } from './book.entity';

@Injectable()
export class BookCommentsService {
  constructor(
    @InjectRepository(BookComment)
    private readonly commentRepo: Repository<BookComment>,
    @InjectRepository(Book)
    private readonly bookRepo: Repository<Book>,
  ) {}

  async getCommentsByBookId(bookId: number) {
    const book = await this.bookRepo.findOne({ where: { id: bookId } });
    if (!book) throw new NotFoundException(`Книга с ID ${bookId} не найдена`);

    return this.commentRepo.find({
      where: { book_id: bookId },
      order: { created_at: 'DESC' },
    });
  }

  async addComment(
    bookId: number,
    userId: string,
    content: string,
    parentId?: number,
  ) {
    const book = await this.bookRepo.findOne({ where: { id: bookId } });
    if (!book) throw new NotFoundException(`Книга с ID ${bookId} не найдена`);

    const comment = this.commentRepo.create({
      book_id: bookId,
      user_id: userId,
      content,
      parent_id: parentId ?? null,
    });

    return this.commentRepo.save(comment);
  }
}
