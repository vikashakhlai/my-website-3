// src/ratings/ratings.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { Rating } from './rating.entity';
import { CreateRatingDto } from './dto/create-rating.dto';
import { User } from 'src/user/user.entity';
import { Role } from 'src/auth/roles.enum';
import { TargetType } from 'src/common/enums/target-type.enum';
import { Book } from 'src/books/book.entity';
import { Textbook } from 'src/textbooks/textbook.entity';
import { Article } from 'src/articles/article.entity';
import { Media } from 'src/media/media.entity';
import { Personality } from 'src/personalities/personality.entity';

export interface TrendingItem<T = any> {
  type: TargetType;
  id: number;
  score: number;
  votes: number;
  data: T;
}

interface TrendingRaw {
  targetType: TargetType;
  targetId: number;
  avg: string;
  count: string;
}

@Injectable()
export class RatingsService {
  private readonly repoMap: Record<TargetType, Repository<any> | null>;
  private readonly relationsMap: Partial<Record<TargetType, string[]>>;

  constructor(
    @InjectRepository(Rating)
    private readonly ratingRepository: Repository<Rating>,
    @InjectRepository(Book)
    private readonly bookRepo: Repository<Book>,
    @InjectRepository(Textbook)
    private readonly textbookRepo: Repository<Textbook>,
    @InjectRepository(Article)
    private readonly articleRepo: Repository<Article>,
    @InjectRepository(Media)
    private readonly mediaRepo: Repository<Media>,
    @InjectRepository(Personality)
    private readonly personalityRepo: Repository<Personality>,
  ) {
    this.repoMap = {
      [TargetType.BOOK]: this.bookRepo,
      [TargetType.TEXTBOOK]: this.textbookRepo,
      [TargetType.ARTICLE]: this.articleRepo,
      [TargetType.MEDIA]: this.mediaRepo,
      [TargetType.PERSONALITY]: this.personalityRepo,
      [TargetType.AUTHOR]: null,
    };
    this.relationsMap = {
      [TargetType.BOOK]: ['authors', 'tags', 'publisher'],
      [TargetType.ARTICLE]: ['theme'],
      [TargetType.MEDIA]: ['dialect', 'topics'],
      [TargetType.PERSONALITY]: [],
    };
  }

  /** ✅ Создать или обновить рейтинг */
  async createOrUpdate(dto: CreateRatingDto, user: User): Promise<Rating> {
    const existing = await this.ratingRepository.findOne({
      where: {
        user_id: user.id,
        target_type: dto.target_type,
        target_id: dto.target_id,
      },
    });

    if (existing) {
      existing.value = dto.value;
      existing.updated_at = new Date();
      return this.ratingRepository.save(existing);
    }

    const rating = this.ratingRepository.create({
      ...dto,
      user,
      user_id: user.id,
    });

    return this.ratingRepository.save(rating);
  }

  /** ✅ Получить все рейтинги для сущности */
  async findByTarget(
    target_type: TargetType,
    target_id: number,
  ): Promise<Rating[]> {
    return this.ratingRepository.find({
      where: { target_type, target_id },
      relations: ['user'],
      order: { created_at: 'DESC' },
    });
  }

  /** ✅ Средний рейтинг + число голосов */
  async getAverage(
    target_type: TargetType,
    target_id: number,
  ): Promise<{ average: number; votes: number }> {
    const { avg, count } = await this.ratingRepository
      .createQueryBuilder('rating')
      .select('AVG(rating.value)', 'avg')
      .addSelect('COUNT(rating.id)', 'count')
      .where('rating.target_type = :target_type', { target_type })
      .andWhere('rating.target_id = :target_id', { target_id })
      .getRawOne();

    return {
      average: avg ? Number(parseFloat(avg).toFixed(2)) : 0,
      votes: count ? Number(count) : 0,
    };
  }

  /** ✅ Удалить рейтинг (только свой, или SUPER_ADMIN) */
  async delete(id: number, user: User): Promise<void> {
    const rating = await this.ratingRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!rating) throw new NotFoundException('Рейтинг не найден');

    const isOwner = rating.user.id === user.id;
    const isSuperAdmin = user.role === Role.SUPER_ADMIN;

    if (!isOwner && !isSuperAdmin) {
      throw new ForbiddenException(
        'Вы можете удалять только свой рейтинг. SUPER_ADMIN может удалять любой.',
      );
    }

    await this.ratingRepository.remove(rating);
  }

  async getTrendingWithData(limit = 10): Promise<TrendingItem[]> {
    const rows = await this.ratingRepository
      .createQueryBuilder('rating')
      .select('rating.target_type', 'targetType')
      .addSelect('rating.target_id', 'targetId')
      .addSelect('AVG(rating.value)', 'avg')
      .addSelect('COUNT(rating.id)', 'count')
      .groupBy('rating.target_type')
      .addGroupBy('rating.target_id')
      .orderBy('avg', 'DESC')
      .addOrderBy('count', 'DESC')
      .limit(limit * 2)
      .getRawMany<TrendingRaw>();

    if (!rows.length) {
      return [];
    }

    const hydrated = await this.hydrateTrending(rows);
    return hydrated.slice(0, limit);
  }

  private async hydrateTrending(rows: TrendingRaw[]): Promise<TrendingItem[]> {
    const idsByType = new Map<TargetType, Set<number>>();

    for (const row of rows) {
      const set = idsByType.get(row.targetType) ?? new Set<number>();
      set.add(row.targetId);
      idsByType.set(row.targetType, set);
    }

    const dataByType = new Map<TargetType, Map<number, any>>();

    await Promise.all(
      Array.from(idsByType.entries()).map(async ([type, ids]) => {
        const repo = this.repoMap[type] ?? null;
        if (!repo || !ids.size) {
          return;
        }
        const relations = this.relationsMap[type] ?? undefined;
        const entities = await repo.find({
          where: { id: In([...ids]) },
          relations,
        });
        dataByType.set(
          type,
          new Map(entities.map((entity) => [entity.id, entity])),
        );
      }),
    );

    const result: TrendingItem[] = [];
    for (const row of rows) {
      const data =
        dataByType.get(row.targetType)?.get(row.targetId);
      if (!data) continue;
      result.push({
        type: row.targetType,
        id: row.targetId,
        score: Number(parseFloat(row.avg).toFixed(2)),
        votes: Number(row.count),
        data,
      });
    }

    return result;
  }
}
