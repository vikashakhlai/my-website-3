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
import { Not, Repository } from 'typeorm';
import { ArticleRefDto } from './dto/article-ref.dto';
import { BookRefDto } from './dto/book-ref.dto';
import { PersonalityResponseDto } from './dto/personality-response.dto';
import { QuoteDto } from './dto/quote.dto';
import { Era, Personality } from './personality.entity';

@Injectable()
export class PersonalitiesService {
  constructor(
    @InjectRepository(Personality)
    private readonly personalityRepo: Repository<Personality>,

    @InjectRepository(Comment)
    private readonly commentRepo: Repository<Comment>,

    @InjectRepository(Rating)
    private readonly ratingRepo: Repository<Rating>,

    @InjectRepository(Favorite)
    private readonly favoriteRepo: Repository<Favorite>,
  ) {}

  async findAll(
    page: number,
    limit: number,
    search?: string,
    era?: Era,
    userId?: string,
    sort: 'latest' | 'rating' | 'popular' = 'latest',
  ) {
    try {
      if (!page || page <= 0) {
        throw new BadRequestException(
          'Номер страницы должен быть положительным числом',
        );
      }

      if (!limit || limit <= 0) {
        throw new BadRequestException(
          'Лимит должен быть положительным числом ',
        );
      }

      if (search && typeof search !== 'string') {
        throw new BadRequestException('Поисковый запрос должен быть строкой');
      }

      if (era && !Object.values(Era).includes(era)) {
        throw new BadRequestException(
          `Некорректная эпоха. Допустимые значения: ${Object.values(Era).join(', ')}`,
        );
      }

      if (sort && !['latest', 'rating', 'popular'].includes(sort)) {
        throw new BadRequestException('Некорректный тип сортировки');
      }

      const qb = this.personalityRepo
        .createQueryBuilder('p')
        .leftJoinAndSelect('p.articles', 'articles')
        .leftJoinAndSelect('p.books', 'books')
        .skip((page - 1) * limit)
        .take(limit);

      const term = (search ?? '').trim();
      if (term) {
        qb.andWhere(
          `(p.name ILIKE :term OR array_to_string(p.facts, ' ') ILIKE :term)`,
          { term: `%${term}%` },
        );
      }

      if (era) qb.andWhere('p.era = :era', { era });

      qb.leftJoin(
        (sub) =>
          sub
            .from(Comment, 'c')
            .select('c.target_id', 'pid')
            .addSelect('COUNT(c.id)', 'count')
            .where('c.target_type = :t', { t: TargetType.PERSONALITY })
            .groupBy('c.target_id'),
        'comments',
        'comments.pid = p.id',
      );

      qb.addSelect('COALESCE(comments.count, 0)', 'commentCount');

      qb.leftJoin(
        (sub) =>
          sub
            .from(Rating, 'r')
            .select('r.target_id', 'pid')
            .addSelect('AVG(r.value)', 'avg')
            .addSelect('COUNT(r.id)', 'count')
            .where('r.target_type = :t', { t: TargetType.PERSONALITY })
            .groupBy('r.target_id'),
        'rating',
        'rating.pid = p.id',
      );

      qb.addSelect('COALESCE(rating.avg, 0)', 'averageRating');
      qb.addSelect('COALESCE(rating.count, 0)', 'ratingCount');

      if (userId) {
        qb.leftJoin(
          Favorite,
          'fav',
          'fav.targetId = p.id AND fav.targetType = :ft AND fav.userId = :uid',
          { ft: TargetType.PERSONALITY, uid: userId },
        );
        qb.addSelect(
          'CASE WHEN fav.id IS NULL THEN false ELSE true END',
          'isFavorite',
        );
      } else {
        qb.addSelect('false', 'isFavorite');
      }

      switch (sort) {
        case 'rating':
          qb.orderBy('averageRating', 'DESC');
          break;
        case 'popular':
          qb.orderBy('commentCount', 'DESC');
          break;
        default:
          qb.orderBy('p.id', 'DESC');
      }

      const [entities, total] = await qb.getManyAndCount();
      const raw = await qb.getRawMany();

      const items = entities.map((entity, i) => ({
        id: entity.id,
        name: entity.name,
        years: entity.years ?? '',
        position: entity.position ?? '',
        biography: entity.biography ?? '',
        facts: entity.facts ?? [],
        era: entity.era ?? Era.MODERN,
        imageUrl: entity.imageUrl ?? '',
        books: entity.books.map((b) => ({
          id: b.id,
          title: b.title,
          description: b.description,
          publication_year: b.publication_year,
          cover_url: b.cover_url,
        })) as BookRefDto[],
        articles: entity.articles.map((a) => ({
          id: a.id,
          title: a.titleRu,
          created_at: a.createdAt?.toISOString() ?? '',
        })) as ArticleRefDto[],
        quotes: [] as QuoteDto[],
        averageRating: Number(raw[i].averageRating),
        ratingCount: Number(raw[i].ratingCount),
        commentsCount: Number(raw[i].commentCount),
        isFavorite:
          raw[i].isFavorite === true ||
          raw[i].isFavorite === 'true' ||
          raw[i].isFavorite === 1,
        userRating: null,
        canRate: Boolean(userId),
        canComment: Boolean(userId),
      }));

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
      throw new InternalServerErrorException(
        'Ошибка при получении списка личностей',
      );
    }
  }

  async findOne(id: number, userId?: string) {
    if (!id || id <= 0) {
      throw new BadRequestException(
        'ID личности должен быть положительным числом',
      );
    }

    if (userId && typeof userId !== 'string') {
      throw new BadRequestException('ID пользователя должен быть строкой');
    }

    try {
      const personality = await this.personalityRepo.findOne({
        where: { id },
        relations: ['articles', 'books', 'quotes'],
      });

      if (!personality) throw new NotFoundException('Личность не найдена');

      const comments = await this.commentRepo.find({
        where: { target_type: TargetType.PERSONALITY, target_id: id },
        order: { created_at: 'DESC' },
        relations: ['user'],
      });

      const [avgRow, userRating, isFavorite] = await Promise.all([
        this.ratingRepo
          .createQueryBuilder('r')
          .select('AVG(r.value)', 'average')
          .addSelect('COUNT(*)', 'count')
          .where('r.target_id = :id', { id })
          .andWhere('r.target_type = :type', { type: TargetType.PERSONALITY })
          .getRawOne(),

        userId
          ? this.ratingRepo.findOne({
              where: {
                target_id: id,
                target_type: TargetType.PERSONALITY,
                user_id: userId,
              },
            })
          : null,

        userId
          ? this.favoriteRepo.exists({
              where: {
                targetId: id,
                targetType: TargetType.PERSONALITY,
                userId,
              },
            })
          : false,
      ]);

      return {
        id: personality.id,
        name: personality.name,
        years: personality.years ?? '',
        position: personality.position ?? '',
        biography: personality.biography ?? '',
        facts: personality.facts ?? [],
        era: personality.era ?? Era.MODERN,
        imageUrl: personality.imageUrl ?? '',
        books: personality.books.map((b) => ({
          id: b.id,
          title: b.title,
          description: b.description,
          publication_year: b.publication_year,
          cover_url: b.cover_url,
        })) as BookRefDto[],
        articles: personality.articles.map((a) => ({
          id: a.id,
          title: a.titleRu,
          created_at: a.createdAt?.toISOString() ?? '',
        })) as ArticleRefDto[],
        quotes: personality.quotes.map((q) => ({
          id: q.id,
          text_ar: q.text_ar,
          text_ru: q.text_ru,
        })) as QuoteDto[],
        comments,
        commentsCount: comments.length,

        averageRating: avgRow?.average ? Number(avgRow.average) : null,
        ratingCount: avgRow?.count ? Number(avgRow.count) : 0,
        userRating: userRating?.value ?? null,

        isFavorite: Boolean(isFavorite),
        canRate: Boolean(userId),
        canComment: Boolean(userId),
      } as PersonalityResponseDto;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Ошибка при получении данных личности',
      );
    }
  }

  async getRandom(limit = 3): Promise<PersonalityResponseDto[]> {
    if (limit <= 0) {
      throw new BadRequestException('Лимит должен быть положительным числом');
    }

    try {
      const personalities = await this.personalityRepo
        .createQueryBuilder('p')
        .leftJoinAndSelect('p.articles', 'articles')
        .leftJoinAndSelect('p.books', 'books')
        .leftJoinAndSelect('p.quotes', 'quotes')
        .orderBy('RANDOM()')
        .limit(limit)
        .getMany();

      return personalities.map((p) => ({
        id: p.id,
        name: p.name,
        years: p.years ?? '',
        position: p.position ?? '',
        biography: p.biography ?? '',
        facts: p.facts ?? [],
        era: p.era ?? Era.MODERN,
        imageUrl: p.imageUrl ?? '',
        books: p.books.map((b) => ({
          id: b.id,
          title: b.title,
          description: b.description,
          publication_year: b.publication_year,
          cover_url: b.cover_url,
        })) as BookRefDto[],
        articles: p.articles.map((a) => ({
          id: a.id,
          title: a.titleRu,
          created_at: a.createdAt?.toISOString() ?? '',
        })) as ArticleRefDto[],
        quotes: p.quotes.map((q) => ({
          id: q.id,
          text_ar: q.text_ar,
          text_ru: q.text_ru,
        })) as QuoteDto[],
        averageRating: null,
        ratingCount: 0,
        commentsCount: 0,
        userRating: null,
        isFavorite: false,
        canRate: false,
        canComment: false,
      }));
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Ошибка при получении случайных личностей',
      );
    }
  }

  async getContemporaries(targetId: number): Promise<PersonalityResponseDto[]> {
    if (!targetId || targetId <= 0) {
      throw new BadRequestException(
        'ID личности должен быть положительным числом',
      );
    }

    try {
      const target = await this.personalityRepo.findOne({
        where: { id: targetId },
        select: ['years'],
      });

      if (!target?.years) return [];

      const targetRange = this.parseYears(target.years);
      if (!targetRange) return [];

      const all = await this.personalityRepo.find({
        where: { id: Not(targetId) },
        relations: ['articles', 'books', 'quotes'],
      });

      const contemporaries = all.filter((p) => {
        const range = this.parseYears(p.years);
        return range
          ? targetRange[0] <= range[1] && range[0] <= targetRange[1]
          : false;
      });

      return contemporaries.map((p) => ({
        id: p.id,
        name: p.name,
        years: p.years ?? '',
        position: p.position ?? '',
        biography: p.biography ?? '',
        facts: p.facts ?? [],
        era: p.era ?? Era.MODERN,
        imageUrl: p.imageUrl ?? '',
        books: p.books.map((b) => ({
          id: b.id,
          title: b.title,
          description: b.description,
          publication_year: b.publication_year,
          cover_url: b.cover_url,
        })) as BookRefDto[],
        articles: p.articles.map((a) => ({
          id: a.id,
          title: a.titleRu,
          created_at: a.createdAt?.toISOString() ?? '',
        })) as ArticleRefDto[],
        quotes: p.quotes.map((q) => ({
          id: q.id,
          text_ar: q.text_ar,
          text_ru: q.text_ru,
        })) as QuoteDto[],
        averageRating: null,
        ratingCount: 0,
        commentsCount: 0,
        userRating: null,
        isFavorite: false,
        canRate: false,
        canComment: false,
      }));
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Ошибка при получении современников',
      );
    }
  }

  private parseYears(yearsStr?: string): [number, number] | null {
    if (!yearsStr) return null;
    const clean = yearsStr.trim();

    const hasPresent = clean.includes('н.в.') || clean.includes('н.в');
    let endYear = hasPresent ? new Date().getFullYear() : undefined;

    const matches = clean.match(/(\d{3,4})/g);
    if (!matches?.length) return null;

    const startYear = parseInt(matches[0], 10);
    if (matches.length >= 2) endYear = parseInt(matches[1], 10);
    else if (!endYear) endYear = startYear + 50;

    return isNaN(startYear) || isNaN(endYear) ? null : [startYear, endYear];
  }
}
