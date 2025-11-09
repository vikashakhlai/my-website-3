import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from 'src/comments/comment.entity';
import { TargetType } from 'src/common/enums/target-type.enum';
import { Favorite } from 'src/favorites/favorite.entity';
import { Rating } from 'src/ratings/rating.entity';
import { In, Repository } from 'typeorm';
import { Author } from '../authors/authors.entity';
import { Tag } from '../tags/tags.entity';
import { Book } from './book.entity';
import { CreateBookDto } from './dto/create-book.dto';
import { SearchBooksDto } from './dto/search-books.dto';
import { UpdateBookDto } from './dto/update-book.dto';

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

  async findLatest(limit: number) {
    if (!limit || limit <= 0) {
      throw new BadRequestException('Лимит должен быть положительным числом');
    }

    try {
      return await this.bookRepo.find({
        relations: ['authors', 'tags'],
        order: { created_at: 'DESC' },
        take: limit,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Ошибка при получении последних книг',
      );
    }
  }

  async searchBooks(dto: SearchBooksDto) {
    try {
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
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Ошибка при поиске книг');
    }
  }

  async findOneWithRelated(id: number, userId?: string) {
    if (!id || id <= 0) {
      throw new BadRequestException(
        'ID книги должен быть положительным числом',
      );
    }

    const book = await this.findOne(id, userId);

    if (!book) throw new BadRequestException('Книга с таким ID не найдена');

    try {
      const [similarBooks, otherBooksByAuthor] = await Promise.all([
        this.getSimilarBooks(id),
        this.getOtherBooksByAuthor(id),
      ]);

      return { book, similarBooks, otherBooksByAuthor };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Ошибка при получении деталей книги',
      );
    }
  }

  async findOne(id: number, userId?: string) {
    if (!id || id <= 0) {
      throw new BadRequestException(
        'ID книги должен быть положительным числом',
      );
    }

    try {
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
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Ошибка при получении книги');
    }
  }

  async create(dto: CreateBookDto) {
    if (!dto) {
      throw new BadRequestException('Данные книги обязательны');
    }

    if (
      !dto.title ||
      typeof dto.title !== 'string' ||
      dto.title.trim() === ''
    ) {
      throw new BadRequestException('Название книги обязательно');
    }

    try {
      const authors = dto.authorIds?.length
        ? await this.authorRepo.find({ where: { id: In(dto.authorIds) } })
        : [];
      const tags = dto.tagIds?.length
        ? await this.tagRepo.find({ where: { id: In(dto.tagIds) } })
        : [];

      const book = this.bookRepo.create({ ...dto, authors, tags });
      return await this.bookRepo.save(book);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Ошибка при создании книги');
    }
  }

  async update(id: number, dto: UpdateBookDto) {
    if (!id || id <= 0) {
      throw new BadRequestException(
        'ID книги должен быть положительным числом',
      );
    }

    if (!dto || Object.keys(dto).length === 0) {
      throw new BadRequestException('Нет данных для обновления');
    }

    try {
      const book = await this.findOne(id);

      if (!book) throw new BadRequestException('Книга с таким ID не найдена');

      if (dto.authorIds)
        book.authors = await this.authorRepo.find({
          where: { id: In(dto.authorIds) },
        });

      if (dto.tagIds)
        book.tags = await this.tagRepo.find({
          where: { id: In(dto.tagIds) },
        });

      Object.assign(book, dto);
      return await this.bookRepo.save(book);
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Ошибка при обновлении книги');
    }
  }

  async remove(id: number) {
    if (!id || id <= 0) {
      throw new BadRequestException(
        'ID книги должен быть положительным числом',
      );
    }

    try {
      const book = await this.findOne(id);

      if (!book) throw new BadRequestException('Книга с таким ID не найдена');

      await this.bookRepo.remove(book);
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Ошибка при удалении книги');
    }
  }

  async getComments(id: number) {
    if (!id || id <= 0) {
      throw new BadRequestException(
        'ID книги должен быть положительным числом',
      );
    }

    try {
      return await this.commentRepo.find({
        where: { target_type: TargetType.BOOK, target_id: id },
        relations: ['user'],
        order: { created_at: 'ASC' },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Ошибка при получении комментариев к книге',
      );
    }
  }

  async addComment(
    id: number,
    userId: string,
    content: string,
    parentId?: number,
  ) {
    if (!id || id <= 0) {
      throw new BadRequestException(
        'ID книги должен быть положительным числом',
      );
    }

    try {
      const comment = this.commentRepo.create({
        target_type: TargetType.BOOK,
        target_id: id,
        user_id: userId,
        content: content.trim(),
        parent: parentId ? ({ id: parentId } as Comment) : null,
      });
      return await this.commentRepo.save(comment);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Ошибка при добавлении комментария',
      );
    }
  }

  async rateBook(id: number, userId: string, value: number) {
    if (!id || id <= 0) {
      throw new BadRequestException(
        'ID книги должен быть положительным числом',
      );
    }

    try {
      let rating = await this.ratingRepo.findOne({
        where: { target_type: TargetType.BOOK, target_id: id, user_id: userId },
      });

      if (rating) {
        rating.value = value;
      } else {
        rating = this.ratingRepo.create({
          target_type: TargetType.BOOK,
          target_id: id,
          user_id: userId,
          value,
        });
      }

      return await this.ratingRepo.save(rating);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Ошибка при оценке книги');
    }
  }

  async getSimilarBooks(bookId: number) {
    if (!bookId || bookId <= 0) {
      throw new BadRequestException(
        'ID книги должен быть положительным числом',
      );
    }

    try {
      const book = await this.bookRepo.findOne({
        where: { id: bookId },
        relations: ['tags'],
      });
      if (!book) throw new NotFoundException('Книга не найдена');
      if (!book.tags?.length) return [];

      const tagIds = book.tags.map((t) => t.id);

      return await this.bookRepo
        .createQueryBuilder('b')
        .leftJoinAndSelect('b.tags', 'tag')
        .leftJoinAndSelect('b.authors', 'author')
        .where('b.id != :bookId', { bookId })
        .andWhere('tag.id IN (:...tagIds)', { tagIds })
        .orderBy('b.created_at', 'DESC')
        .limit(5)
        .getMany();
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Ошибка при получении похожих книг',
      );
    }
  }

  async getOtherBooksByAuthor(bookId: number) {
    if (!bookId || bookId <= 0) {
      throw new BadRequestException(
        'ID книги должен быть положительным числом',
      );
    }

    try {
      const book = await this.bookRepo.findOne({
        where: { id: bookId },
        relations: ['authors'],
      });
      if (!book) throw new NotFoundException('Книга не найдена');
      if (!book.authors?.length) return [];

      const authorIds = book.authors.map((a) => a.id);

      return await this.bookRepo
        .createQueryBuilder('b')
        .leftJoinAndSelect('b.authors', 'a')
        .leftJoinAndSelect('b.tags', 'tag')
        .where('a.id IN (:...authorIds)', { authorIds })
        .andWhere('b.id != :bookId', { bookId })
        .orderBy('b.created_at', 'DESC')
        .limit(5)
        .getMany();
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Ошибка при получении других книг автора',
      );
    }
  }
}
