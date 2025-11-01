import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Book } from './book.entity';
import { Author } from '../authors/authors.entity';
import { Tag } from '../tags/tags.entity';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { Comment } from 'src/comments/comment.entity';
import { Rating } from 'src/ratings/rating.entity';
import { Favorite } from 'src/favorites/favorite.entity';
import { TargetType } from 'src/common/enums/target-type.enum';

@Injectable()
export class BookService {
  constructor(
    @InjectRepository(Book)
    private readonly bookRepo: Repository<Book>,

    @InjectRepository(Author)
    private readonly authorRepo: Repository<Author>,

    @InjectRepository(Tag)
    private readonly tagRepo: Repository<Tag>,

    @InjectRepository(Comment)
    private readonly commentRepo: Repository<Comment>,

    @InjectRepository(Rating)
    private readonly ratingRepo: Repository<Rating>,

    @InjectRepository(Favorite)
    private readonly favoriteRepo: Repository<Favorite>,
  ) {}

  // 🕐 Последние добавленные книги
  async findLatest(limit: number) {
    return this.bookRepo.find({
      relations: ['authors', 'tags'],
      order: { created_at: 'DESC' },
      take: limit,
    });
  }

  // === 🔍 Поиск книг с фильтрами ===
  async searchBooks({
    page = 1,
    limit = 20,
    tag,
    author,
    title,
  }: {
    page?: number;
    limit?: number;
    tag?: string;
    author?: string;
    title?: string;
  }) {
    const query = this.bookRepo
      .createQueryBuilder('book')
      .leftJoinAndSelect('book.authors', 'authors')
      .leftJoinAndSelect('book.tags', 'tags')
      .orderBy('book.created_at', 'DESC');

    if (tag) query.andWhere('tags.name ILIKE :tag', { tag: `%${tag}%` });
    if (author)
      query.andWhere('authors.full_name ILIKE :author', {
        author: `%${author}%`,
      });
    if (title)
      query.andWhere('book.title ILIKE :title', { title: `%${title}%` });

    const skip = (page - 1) * limit;
    query.skip(skip).take(limit);

    const [books, totalCount] = await query.getManyAndCount();

    return {
      books,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
    };
  }

  async findAll(): Promise<Book[]> {
    return this.bookRepo.find({
      relations: ['authors', 'tags'],
      order: { created_at: 'DESC' },
    });
  }

  // === 📘 Одна книга ===
  async findOne(id: number, user_id?: string): Promise<Book> {
    const book = await this.bookRepo.findOne({
      where: { id },
      relations: ['authors', 'tags', 'publisher'],
    });

    if (!book) throw new NotFoundException(`Книга с ID ${id} не найдена`);

    // ⚙️ Подсчёт рейтингов из универсальной таблицы
    const ratings = await this.ratingRepo.find({
      where: { target_type: TargetType.BOOK, target_id: id },
    });

    const ratingCount = ratings.length;
    const averageRating =
      ratingCount > 0
        ? Number(
            (
              ratings.reduce((sum, r) => sum + (r.value ?? 0), 0) / ratingCount
            ).toFixed(2),
          )
        : null;

    let userRating: number | null = null;
    if (user_id && ratings.length > 0) {
      const found = ratings.find((r) => r.user_id === user_id);
      userRating = found ? found.value : null;
    }

    Object.assign(book, { averageRating, ratingCount, userRating });
    return book;
  }

  // === ➕ Создать ===
  async create(dto: CreateBookDto): Promise<Book> {
    const authors = dto.authorIds?.length
      ? await this.authorRepo.find({ where: { id: In(dto.authorIds) } })
      : [];

    const tags = dto.tagIds?.length
      ? await this.tagRepo.find({ where: { id: In(dto.tagIds) } })
      : [];

    const book = this.bookRepo.create({ ...dto, authors, tags });
    const saved = await this.bookRepo.save(book);
    return this.findOne(saved.id);
  }

  // === ✏️ Обновить ===
  async update(id: number, dto: UpdateBookDto): Promise<Book> {
    const book = await this.findOne(id);

    if (dto.authorIds) {
      book.authors = await this.authorRepo.find({
        where: { id: In(dto.authorIds) },
      });
    }

    if (dto.tagIds) {
      book.tags = await this.tagRepo.find({ where: { id: In(dto.tagIds) } });
    }

    Object.assign(book, dto);
    const updated = await this.bookRepo.save(book);
    return this.findOne(updated.id);
  }

  // === ❌ Удалить ===
  async remove(id: number): Promise<void> {
    const book = await this.findOne(id);
    await this.bookRepo.remove(book);
  }

  // === 📚 Похожие книги по тегам ===
  async getSimilarBooks(book_id: number): Promise<Book[]> {
    const book = await this.bookRepo.findOne({
      where: { id: book_id },
      relations: ['tags'],
    });
    if (!book) throw new NotFoundException('Книга не найдена');
    if (!book.tags?.length) return [];

    const tagIds = book.tags.map((t) => t.id);
    return this.bookRepo
      .createQueryBuilder('b')
      .leftJoinAndSelect('b.tags', 'tag')
      .leftJoinAndSelect('b.authors', 'author')
      .where('b.id != :book_id', { book_id })
      .andWhere('tag.id IN (:...tagIds)', { tagIds })
      .orderBy('b.created_at', 'DESC')
      .limit(10)
      .getMany();
  }

  // === 👩‍💻 Другие книги автора ===
  async getOtherBooksByAuthor(book_id: number): Promise<Book[]> {
    const book = await this.bookRepo.findOne({
      where: { id: book_id },
      relations: ['authors'],
    });
    if (!book) throw new NotFoundException('Книга не найдена');
    if (!book.authors?.length) return [];

    const authorIds = book.authors.map((a) => a.id);
    return this.bookRepo
      .createQueryBuilder('b')
      .leftJoinAndSelect('b.authors', 'a')
      .leftJoinAndSelect('b.tags', 'tag')
      .where('a.id IN (:...authorIds)', { authorIds })
      .andWhere('b.id != :book_id', { book_id })
      .orderBy('b.created_at', 'DESC')
      .limit(10)
      .getMany();
  }

  // === 💬 Комментарии (универсальные) ===
  async getComments(book_id: number) {
    return this.commentRepo.find({
      where: { target_type: TargetType.BOOK, target_id: book_id },
      relations: ['user'],
      order: { created_at: 'ASC' },
    });
  }

  // === ⭐ Рейтинги (универсальные) ===
  async getRatings(book_id: number) {
    const ratings = await this.ratingRepo.find({
      where: { target_type: TargetType.BOOK, target_id: book_id },
    });

    if (!ratings.length) return { average: null, count: 0 };

    const average =
      ratings.reduce((acc, r) => acc + (r.value ?? 0), 0) / ratings.length;

    return { average: Number(average.toFixed(2)), count: ratings.length };
  }

  async rateBook(book_id: number, user_id: string, value: number) {
    let rating = await this.ratingRepo.findOne({
      where: { target_type: TargetType.BOOK, target_id: book_id, user_id },
    });

    if (rating) {
      rating.value = value;
    } else {
      rating = this.ratingRepo.create({
        target_type: TargetType.BOOK,
        target_id: book_id,
        user_id,
        value,
      });
    }

    return this.ratingRepo.save(rating);
  }

  // === 💬 Добавить комментарий (универсальная система) ===
  async addComment(
    book_id: number,
    user_id: string,
    content: string,
    parent_id?: number | null,
  ) {
    const comment = this.commentRepo.create({
      target_type: TargetType.BOOK,
      target_id: book_id,
      user_id,
      content,
      parent: parent_id ? ({ id: parent_id } as Comment) : null,
    });

    return this.commentRepo.save(comment);
  }

  // === 📦 Книга + похожие + книги автора ===
  async findOneWithRelated(
    id: number,
    user_id?: string,
  ): Promise<{
    book: Book & {
      averageRating: number | null;
      ratingCount: number;
      userRating: number | null;
    };
    similarBooks: Book[];
    otherBooksByAuthor: Book[];
  }> {
    const book = await this.findOne(id, user_id);

    const [similarBooks, otherBooksByAuthor] = await Promise.all([
      this.getSimilarBooks(id),
      this.getOtherBooksByAuthor(id),
    ]);

    return {
      book: book as Book & {
        averageRating: number | null;
        ratingCount: number;
        userRating: number | null;
      },
      similarBooks,
      otherBooksByAuthor,
    };
  }
}
