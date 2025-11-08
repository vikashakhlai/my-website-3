import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Book } from 'src/books/book.entity';
import { makeAbsoluteUrl } from 'src/utils/media-url.util';
import { Repository } from 'typeorm';
import { Author } from './authors.entity';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';

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

    const author = await this.authorsRepo
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.books', 'b')
      .where('a.id = :id', { id })
      .orderBy('b.publication_year', 'DESC', 'NULLS LAST')
      .getOne();

    if (!author) throw new NotFoundException('Автор не найден');

    const books = (author.books ?? []).map((b: Book) => ({
      id: b.id,
      title: b.title,
      cover_url: makeAbsoluteUrl(b.cover_url),
      publication_year: b.publication_year,
    }));

    return {
      id: author.id,
      full_name: author.fullName,
      bio: author.bio,
      photo_url: makeAbsoluteUrl(author.photoUrl),
      books,
    };
  }

  async getAllAuthors() {
    return await this.authorsRepo
      .createQueryBuilder('a')
      .select(['a.id', 'a.fullName AS full_name'])
      .orderBy('a.fullName', 'ASC')
      .getRawMany();
  }

  async createAuthor(dto: CreateAuthorDto) {
    const author = this.authorsRepo.create({
      fullName: dto.fullName,
      bio: dto.bio ?? null,
      photoUrl: dto.photoUrl ?? null,
    });

    const saved = await this.authorsRepo.save(author);
    return { message: 'Автор создан', id: saved.id };
  }

  async updateAuthor(id: number, dto: UpdateAuthorDto) {
    const author = await this.authorsRepo.findOne({ where: { id } });

    if (!author) throw new NotFoundException('Автор не найден');

    if (dto.fullName) author.fullName = dto.fullName;
    if (dto.bio !== undefined) author.bio = dto.bio;
    if (dto.photoUrl !== undefined) author.photoUrl = dto.photoUrl;

    await this.authorsRepo.save(author);
    return { message: 'Автор обновлён', id: author.id };
  }

  async deleteAuthor(id: number) {
    const author = await this.authorsRepo.findOne({ where: { id } });

    if (!author) throw new NotFoundException('Автор не найден');

    await this.authorsRepo.remove(author);

    return { message: `Автор #${id} удалён` };
  }
}
