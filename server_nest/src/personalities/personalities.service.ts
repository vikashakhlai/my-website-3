import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { Personality, Era } from './personality.entity';
import { Comment } from 'src/comments/comment.entity';
import { TargetType } from 'src/common/enums/target-type.enum';

@Injectable()
export class PersonalitiesService {
  constructor(
    @InjectRepository(Personality)
    private readonly personalityRepo: Repository<Personality>,

    @InjectRepository(Comment)
    private readonly commentRepo: Repository<Comment>,
  ) {}

  // ✅ Список с фильтрацией и пагинацией
  async findAll(
    page = 1,
    limit = 12,
    search?: string,
    era?: Era,
  ): Promise<{
    data: Personality[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const qb = this.personalityRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.articles', 'articles')
      .leftJoinAndSelect('p.books', 'books');

    if (search) {
      qb.andWhere('LOWER(p.name) LIKE LOWER(:search)', {
        search: `%${search}%`,
      });
    }

    if (era) qb.andWhere('p.era = :era', { era });

    qb.orderBy('p.createdAt', 'DESC').skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ✅ Одна личность с комментариями и рейтингом
  async findOne(id: number, userId?: string): Promise<any> {
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

    return {
      ...personality,
      comments,
      commentCount: comments.length,
    };
  }

  // ✅ Случайные личности
  async getRandom(limit = 3): Promise<Personality[]> {
    return this.personalityRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.articles', 'articles')
      .leftJoinAndSelect('p.books', 'books')
      .orderBy('RANDOM()')
      .limit(limit)
      .getMany();
  }

  // ✅ Современники
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
