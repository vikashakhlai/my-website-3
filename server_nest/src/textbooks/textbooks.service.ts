import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Textbook } from './textbook.entity';
import { Rating } from 'src/ratings/rating.entity';
import { Comment } from 'src/comments/comment.entity';

@Injectable()
export class TextbooksService {
  constructor(
    @InjectRepository(Textbook)
    private readonly textbookRepo: Repository<Textbook>,

    @InjectRepository(Rating)
    private readonly ratingRepo: Repository<Rating>,

    @InjectRepository(Comment)
    private readonly commentRepo: Repository<Comment>,
  ) {}

  /**
   * 📚 Получить все учебники с рейтингом, количеством комментариев,
   *     фильтрацией, сортировкой и пагинацией.
   */
  async getAll(options?: {
    page?: number;
    limit?: number;
    sort?: 'asc' | 'desc';
    level?: string;
  }): Promise<{
    data: (Textbook & {
      averageRating: number | null;
      ratingCount: number;
      commentCount: number;
    })[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const page = Math.max(options?.page || 1, 1);
    const limit = Math.max(options?.limit || 10, 1);
    const sortOrder = options?.sort === 'desc' ? 'DESC' : 'ASC';
    const levelFilter = options?.level?.trim();

    // 🔹 Основной запрос с подзапросами
    const qb = this.textbookRepo
      .createQueryBuilder('t')
      .select([
        't.id AS id',
        't.title AS title',
        't.authors AS authors',
        't.publication_year AS publication_year',
        't.cover_image_url AS cover_image_url',
        't.description AS description',
        't.level AS level',
        't.pdf_url AS pdf_url',
        "(SELECT AVG(r.value) FROM ratings r WHERE r.target_id = t.id AND r.target_type = 'textbook') AS averageRating",
        "(SELECT COUNT(*) FROM ratings r WHERE r.target_id = t.id AND r.target_type = 'textbook') AS ratingCount",
        "(SELECT COUNT(*) FROM comments c WHERE c.target_id = t.id AND c.target_type = 'textbook') AS commentCount",
      ])
      .orderBy('t.id', sortOrder)
      .skip((page - 1) * limit)
      .take(limit);

    if (levelFilter) {
      qb.where('t.level = :level', { level: levelFilter });
    }

    // 🔹 Получаем данные и общее количество
    const [data, total] = await Promise.all([
      qb.getRawMany(),
      this.textbookRepo.count(
        levelFilter ? { where: { level: levelFilter } } : {},
      ),
    ]);

    // 🔹 Приведение типов
    const formatted = data.map((t) => ({
      id: Number(t.id),
      title: t.title,
      authors: t.authors,
      publication_year: t.publication_year
        ? Number(t.publication_year)
        : undefined,
      cover_image_url: t.cover_image_url,
      description: t.description,
      level: t.level,
      pdf_url: t.pdf_url,
      averageRating: t.averageRating ? parseFloat(t.averageRating) : null,
      ratingCount: Number(t.ratingCount),
      commentCount: Number(t.commentCount),
    }));

    return {
      data: formatted,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /** 🔍 Получить учебник по ID с рейтингом и комментариями */
  async getById(id: number, userId?: string) {
    const book = await this.textbookRepo.findOne({ where: { id } });
    if (!book) throw new NotFoundException('Учебник не найден');

    const ratings = await this.ratingRepo.find({
      where: { target_type: 'textbook', target_id: id },
    });

    const commentsCount = await this.commentRepo.count({
      where: { target_type: 'textbook', target_id: id },
    });

    const average =
      ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r.value, 0) / ratings.length
        : null;

    const userRating = userId
      ? (ratings.find((r) => r.user_id === userId)?.value ?? null)
      : null;

    return {
      ...book,
      averageRating: average,
      ratingCount: ratings.length,
      userRating,
      commentCount: commentsCount,
    };
  }

  /** 🎲 Случайный учебник с PDF */
  async getRandom() {
    const book = await this.textbookRepo
      .createQueryBuilder('t')
      .where('t.pdf_url IS NOT NULL')
      .orderBy('RANDOM()')
      .getOne();

    if (!book) throw new NotFoundException('Нет учебников с PDF');
    return book;
  }

  /** ➕ Создать */
  async create(data: Partial<Textbook>) {
    const book = this.textbookRepo.create(data);
    return this.textbookRepo.save(book);
  }

  /** 🔄 Обновить */
  async update(id: number, data: Partial<Textbook>) {
    const book = await this.textbookRepo.preload({ id, ...data });
    if (!book) throw new NotFoundException('Учебник не найден');
    return this.textbookRepo.save(book);
  }

  /** ❌ Удалить */
  async remove(id: number) {
    const book = await this.textbookRepo.findOne({ where: { id } });
    if (!book) throw new NotFoundException('Учебник не найден');
    await this.textbookRepo.remove(book);
    return { message: 'Учебник удалён' };
  }
}
