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
import { SearchBooksDto } from './dto/search-books.dto';

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

  // 🕐 Последние книги
  async findLatest(limit: number) {
    return this.bookRepo.find({
      relations: ['authors', 'tags'],
      order: { created_at: 'DESC' },
      take: limit,
    });
  }

  // === 🔍 Поиск с вычисляемыми полями ===
  async searchBooks(dto: SearchBooksDto) {
    const { page = 1, limit = 20, title, tag, author } = dto;

    const qb = this.bookRepo
      .createQueryBuilder('b')
      .leftJoin('b.tags', 'tagEntity')
      .leftJoin('b.authors', 'authorEntity')
      .select(['b.id', 'b.title', 'b.cover_url', 'b.created_at'])
      .distinct(true)
      .orderBy('b.created_at', 'DESC')
      .offset((page - 1) * limit)
      .limit(limit);

    if (title) {
      qb.andWhere('b.title ILIKE :title', { title: `%${title}%` });
    }

    if (tag) {
      qb.andWhere('tagEntity.name ILIKE :tag', { tag });
    }

    if (author) {
      qb.andWhere('authorEntity.full_name ILIKE :author', { author });
    }

    const [items, total] = await qb.getManyAndCount();

    return {
      items,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  // === 📘 Одна книга + связанные ===
  async findOneWithRelated(id: number, userId?: string) {
    const book = await this.findOne(id, userId);

    const [similarBooks, otherBooksByAuthor] = await Promise.all([
      this.getSimilarBooks(id),
      this.getOtherBooksByAuthor(id),
    ]);

    return { book, similarBooks, otherBooksByAuthor };
  }

  // === 📘 Одна книга ===
  async findOne(id: number, userId?: string) {
    const qb = this.bookRepo
      .createQueryBuilder('b')
      .leftJoinAndSelect('b.authors', 'authors')
      .leftJoinAndSelect('b.tags', 'tags')
      .leftJoinAndSelect('b.publisher', 'publisher')
      .where('b.id = :id', { id });

    qb.addSelect(`
      (SELECT ROUND(AVG(r.value), 2)
       FROM ratings r
       WHERE r.target_type = '${TargetType.BOOK}'
       AND r.target_id = b.id) AS "averageRating"
    `);

    qb.addSelect(`
      (SELECT COUNT(*) FROM ratings r
       WHERE r.target_type = '${TargetType.BOOK}'
       AND r.target_id = b.id) AS "ratingCount"
    `);

    qb.addSelect(`
      EXISTS(
        SELECT 1 FROM favorites f
        WHERE f.target_type = '${TargetType.BOOK}'
        AND f.target_id = b.id
        ${userId ? `AND f.user_id = '${userId}'` : ''}
      ) AS "isFavorite"
    `);

    if (userId) {
      qb.addSelect(`
        (SELECT r.value FROM ratings r
         WHERE r.target_type = '${TargetType.BOOK}'
         AND r.target_id = b.id
         AND r.user_id = '${userId}'
         LIMIT 1) AS "userRating"
      `);
    }

    const result = await qb.getRawAndEntities();
    if (!result.entities[0]) throw new NotFoundException('Книга не найдена');

    return result.entities[0];
  }

  // === CRUD ===
  async create(dto: CreateBookDto) {
    const authors = dto.authorIds?.length
      ? await this.authorRepo.find({ where: { id: In(dto.authorIds) } })
      : [];
    const tags = dto.tagIds?.length
      ? await this.tagRepo.find({ where: { id: In(dto.tagIds) } })
      : [];

    const book = this.bookRepo.create({ ...dto, authors, tags });
    return this.bookRepo.save(book);
  }

  async update(id: number, dto: UpdateBookDto) {
    const book = await this.findOne(id);

    if (dto.authorIds)
      book.authors = await this.authorRepo.find({
        where: { id: In(dto.authorIds) },
      });

    if (dto.tagIds)
      book.tags = await this.tagRepo.find({
        where: { id: In(dto.tagIds) },
      });

    Object.assign(book, dto);
    return this.bookRepo.save(book);
  }

  async remove(id: number) {
    const book = await this.findOne(id);
    await this.bookRepo.remove(book);
  }

  // === Комментарии ===
  async getComments(id: number) {
    return this.commentRepo.find({
      where: { target_type: TargetType.BOOK, target_id: id },
      relations: ['user'],
      order: { created_at: 'ASC' },
    });
  }

  async addComment(
    id: number,
    userId: string,
    content: string,
    parentId?: number,
  ) {
    const comment = this.commentRepo.create({
      target_type: TargetType.BOOK,
      target_id: id,
      user_id: userId,
      content,
      parent: parentId ? ({ id: parentId } as Comment) : null,
    });
    return this.commentRepo.save(comment);
  }

  // === Рейтинг ===
  async rateBook(id: number, userId: string, value: number) {
    let rating = await this.ratingRepo.findOne({
      where: { target_type: TargetType.BOOK, target_id: id, user_id: userId },
    });

    if (rating) rating.value = value;
    else
      rating = this.ratingRepo.create({
        target_type: TargetType.BOOK,
        target_id: id,
        user_id: userId,
        value,
      });

    return this.ratingRepo.save(rating);
  }

  // === Похожие и книги автора ===
  async getSimilarBooks(bookId: number) {
    const book = await this.bookRepo.findOne({
      where: { id: bookId },
      relations: ['tags'],
    });
    if (!book) throw new NotFoundException('Книга не найдена');
    if (!book.tags?.length) return [];

    const tagIds = book.tags.map((t) => t.id);

    return this.bookRepo
      .createQueryBuilder('b')
      .leftJoinAndSelect('b.tags', 'tag')
      .leftJoinAndSelect('b.authors', 'author')
      .where('b.id != :bookId', { bookId })
      .andWhere('tag.id IN (:...tagIds)', { tagIds })
      .orderBy('b.created_at', 'DESC')
      .limit(5)
      .getMany();
  }

  async getOtherBooksByAuthor(bookId: number) {
    const book = await this.bookRepo.findOne({
      where: { id: bookId },
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
      .andWhere('b.id != :bookId', { bookId })
      .orderBy('b.created_at', 'DESC')
      .limit(5)
      .getMany();
  }
}
