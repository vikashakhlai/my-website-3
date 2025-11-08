import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { Personality, Era } from './personality.entity';
import { Comment } from 'src/comments/comment.entity';
import { Rating } from 'src/ratings/rating.entity';
import { Favorite } from 'src/favorites/favorite.entity';
import { TargetType } from 'src/common/enums/target-type.enum';

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

  /** ✅ Список личностей */
  async findAll(
    page: number,
    limit: number,
    search?: string,
    era?: Era,
    userId?: string,
    sort: 'latest' | 'rating' | 'popular' = 'latest',
  ) {
    const qb = this.personalityRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.articles', 'articles')
      .leftJoinAndSelect('p.books', 'books')
      .skip((page - 1) * limit)
      .take(limit);

    // ==== Поиск ====
    const term = (search ?? '').trim();
    if (term) {
      qb.andWhere(
        `(p.name ILIKE :term OR array_to_string(p.facts, ' ') ILIKE :term)`,
        { term: `%${term}%` },
      );
    }

    // ==== Фильтр по эпохе ====
    if (era) qb.andWhere('p.era = :era', { era });

    // ==== Подсчёт комментариев ====
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

    // ==== LEFT JOIN Рейтинг ====
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

    // ==== Избранное ====
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

    // ==== Сортировка ====
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
      ...entity,
      averageRating: Number(raw[i].averageRating),
      ratingCount: Number(raw[i].ratingCount),
      commentCount: Number(raw[i].commentCount),
      isFavorite:
        raw[i].isFavorite === true ||
        raw[i].isFavorite === 'true' ||
        raw[i].isFavorite === 1,
    }));

    return {
      items,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  /** ✅ Одна личность + рейтинг + избранное + комментарии */
  async findOne(id: number, userId?: string) {
    const personality = await this.personalityRepo.findOne({
      where: { id },
      relations: ['articles', 'books'],
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
            where: { targetId: id, targetType: TargetType.PERSONALITY, userId },
          })
        : false,
    ]);

    return {
      ...personality,
      comments,
      commentCount: comments.length,

      averageRating: avgRow?.average
        ? Number(parseFloat(avgRow.average).toFixed(2))
        : null,
      ratingCount: avgRow?.count ? Number(avgRow.count) : 0,
      userRating: userRating?.value ?? null,

      isFavorite: Boolean(isFavorite),
      canRate: Boolean(userId),
      canComment: Boolean(userId),
    };
  }

  /** ✅ Случайные личности */
  async getRandom(limit = 3): Promise<Personality[]> {
    return this.personalityRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.articles', 'articles')
      .leftJoinAndSelect('p.books', 'books')
      .orderBy('RANDOM()')
      .limit(limit)
      .getMany();
  }

  /** ✅ Современники */
  async getContemporaries(targetId: number): Promise<Personality[]> {
    const target = await this.personalityRepo.findOne({
      where: { id: targetId },
      select: ['years'],
    });

    if (!target?.years) return [];

    const targetRange = this.parseYears(target.years);
    if (!targetRange) return [];

    const all = await this.personalityRepo.find({
      where: { id: Not(targetId) },
      relations: ['articles', 'books'],
    });

    return all.filter((p) => {
      const range = this.parseYears(p.years);
      return range
        ? targetRange[0] <= range[1] && range[0] <= targetRange[1]
        : false;
    });
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
