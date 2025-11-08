import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';

import { Comment } from 'src/comments/comment.entity';
import { TargetType } from 'src/common/enums/target-type.enum';
import { Rating } from 'src/ratings/rating.entity';
import { makeAbsoluteUrl } from 'src/utils/media-url.util';
import { Textbook } from './textbook.entity';

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

  private buildQueryWithStats(): SelectQueryBuilder<Textbook> {
    return this.textbookRepo.createQueryBuilder('t').select([
      't.id AS id',
      't.title AS title',
      't.authors AS authors',
      't.publication_year AS publication_year',
      't.cover_image_url AS cover_image_url',
      't.description AS description',
      't.level AS level',
      't.pdf_url AS pdf_url',
      't.createdAt AS createdAt',
      't.updatedAt AS updatedAt',
      `(SELECT AVG(r.value)
          FROM ratings r
          WHERE r.target_id = t.id
          AND r.target_type = '${TargetType.TEXTBOOK}') AS averageRating`,
      `(SELECT COUNT(*)
          FROM ratings r
          WHERE r.target_id = t.id
          AND r.target_type = '${TargetType.TEXTBOOK}') AS ratingCount`,
      `(SELECT COUNT(*)
          FROM comments c
          WHERE c.target_id = t.id
          AND c.target_type = '${TargetType.TEXTBOOK}') AS commentCount`,
    ]);
  }

  async getAll(options?: {
    page?: number;
    limit?: number;
    sort?: 'asc' | 'desc';
    level?: string;
  }) {
    const page = Math.max(options?.page || 1, 1);
    const limit = Math.max(Math.min(options?.limit || 10, 100), 1);
    const sortOrder = options?.sort === 'desc' ? 'DESC' : 'ASC';
    const levelFilter = options?.level?.trim();

    const qb = this.buildQueryWithStats()
      .orderBy('t.id', sortOrder)
      .skip((page - 1) * limit)
      .take(limit);

    if (levelFilter) qb.where('t.level = :level', { level: levelFilter });

    const [data, total] = await Promise.all([
      qb.getRawMany(),
      this.textbookRepo.count(
        levelFilter ? { where: { level: levelFilter } } : {},
      ),
    ]);

    const formatted = data.map((t) => ({
      id: Number(t.id),
      title: t.title,
      authors: t.authors,
      publication_year: t.publication_year
        ? Number(t.publication_year)
        : undefined,
      cover_image_url: makeAbsoluteUrl(t.cover_image_url),
      description: t.description,
      level: t.level,
      pdf_url: makeAbsoluteUrl(t.pdf_url),
      createdAt: new Date(t.createdAt),
      updatedAt: new Date(t.updatedAt),
      averageRating: t.averageRating ? parseFloat(t.averageRating) : null,
      ratingCount: Number(t.ratingCount),
      commentCount: Number(t.commentCount),
    }));

    return {
      data: formatted,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getPublicView(id: number, userId?: string | null) {
    const book = await this.textbookRepo.findOne({ where: { id } });
    if (!book) throw new NotFoundException('Учебник не найден');

    const ratings = await this.ratingRepo.find({
      where: { target_type: TargetType.TEXTBOOK, target_id: id },
    });

    const commentsCount = await this.commentRepo.count({
      where: { target_type: TargetType.TEXTBOOK, target_id: id },
    });

    const average =
      ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r.value, 0) / ratings.length
        : null;

    const userRating = userId
      ? (ratings.find((r) => r.user_id === userId)?.value ?? null)
      : null;

    return {
      id: book.id,
      title: book.title,
      authors: book.authors,
      description: book.description,
      level: book.level,
      publication_year: book.publication_year,
      cover_image_url: makeAbsoluteUrl(book.cover_image_url),
      pdf_url: makeAbsoluteUrl(book.pdf_url),
      createdAt: book.createdAt,
      updatedAt: book.updatedAt,
      canDownload: Boolean(userId),
      averageRating: average,
      ratingCount: ratings.length,
      userRating,
      commentCount: commentsCount,
    };
  }

  async getDownloadFile(id: number, userId: string) {
    if (!userId)
      throw new ForbiddenException('Требуется авторизация для скачивания');

    const textbook = await this.textbookRepo.findOne({ where: { id } });
    if (!textbook) throw new NotFoundException('Учебник не найден');

    if (!textbook.pdf_url) throw new NotFoundException('PDF-файл отсутствует');

    return {
      url: `/uploads/textbooks-pdfs/${textbook.pdf_url}`,
    };
  }

  async getRandom() {
    const book = await this.textbookRepo
      .createQueryBuilder('t')
      .where('t.pdf_url IS NOT NULL')
      .orderBy('RANDOM()')
      .getOne();

    if (!book) throw new NotFoundException('Нет учебников с PDF');

    return {
      id: book.id,
      title: book.title,
      authors: book.authors,
      description: book.description,
      level: book.level,
      publication_year: book.publication_year,
      cover_image_url: makeAbsoluteUrl(book.cover_image_url),
      pdf_url: makeAbsoluteUrl(book.pdf_url),
      createdAt: book.createdAt,
      updatedAt: book.updatedAt,
    };
  }

  async create(data: Partial<Textbook>) {
    return this.textbookRepo.save(this.textbookRepo.create(data));
  }

  async update(id: number, data: Partial<Textbook>) {
    const book = await this.textbookRepo.preload({ id, ...data });
    if (!book) throw new NotFoundException('Учебник не найден');
    return this.textbookRepo.save(book);
  }

  async remove(id: number) {
    const book = await this.textbookRepo.findOne({ where: { id } });
    if (!book) throw new NotFoundException('Учебник не найден');
    await this.textbookRepo.remove(book);
    return { message: 'Учебник удален' };
  }
}
