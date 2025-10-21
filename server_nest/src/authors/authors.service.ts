import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Author } from './authors.entity';
import { Repository } from 'typeorm';
import { Book } from 'src/books/book.entity';

@Injectable()
export class AuthorsService {
  constructor(
    @InjectRepository(Author)
    private readonly authorsRepo: Repository<Author>,
  ) {}

  async getAuthorById(idParam: string | number) {
    const id = Number(idParam);
    if (!Number.isInteger(id) || id <= 0) {
      throw new BadRequestException('Некорректный ID автора');
    }

    // Загружаем автора вместе с книгами
    // и сортируем книги как в Express: publication_year DESC NULLS LAST
    const author = await this.authorsRepo
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.books', 'b')
      .where('a.id = :id', { id })
      .orderBy('b.publication_year', 'DESC', 'NULLS LAST')
      .getOne();

    if (!author) throw new NotFoundException('Автор не найден');

    // Приводим ответ к прежнему контракту
    const books = (author.books ?? []).map((b: Book) => ({
      id: b.id,
      title: b.title,
      cover_url: b.cover_url,
      publication_year: b.publication_year,
    }));

    return {
      id: author.id,
      full_name: author.fullName,
      bio: author.bio,
      photo_url: author.photoUrl,
      books,
    };
  }
}
