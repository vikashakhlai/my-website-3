import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { Personality, Era } from './personality.entity';

@Injectable()
export class PersonalitiesService {
  constructor(
    @InjectRepository(Personality)
    private readonly personalityRepo: Repository<Personality>,
  ) {}

  // ✅ Получить всех (с фильтрацией и пагинацией)
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

    // 🔍 Поиск по имени
    if (search) {
      qb.andWhere('LOWER(p.name) LIKE LOWER(:search)', {
        search: `%${search}%`,
      });
    }

    // 🕰️ Фильтр по эпохе
    if (era) {
      qb.andWhere('p.era = :era', { era });
    }

    qb.orderBy('p.createdAt', 'DESC').skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Получить одну личность
  async findOne(id: number): Promise<Personality | null> {
    return this.personalityRepo.findOne({
      where: { id },
      relations: ['articles', 'books'],
    });
  }

  // Получить случайные личности
  async getRandom(limit = 3): Promise<Personality[]> {
    return this.personalityRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.articles', 'articles')
      .leftJoinAndSelect('p.books', 'books')
      .orderBy('RANDOM()')
      .limit(limit)
      .getMany();
  }

  // Получить современников
  async getContemporaries(targetId: number): Promise<Personality[]> {
    const target = await this.personalityRepo.findOne({
      where: { id: targetId },
      select: ['years'],
    });

    if (!target?.years) return [];

    const targetRange = this.parseYears(target.years);
    if (!targetRange) return [];

    const allPersonalities = await this.personalityRepo.find({
      where: { id: Not(targetId) },
      relations: ['articles', 'books'],
    });

    return allPersonalities.filter((p) => {
      const range = this.parseYears(p.years);
      if (!range) return false;
      return targetRange[0] <= range[1] && range[0] <= targetRange[1];
    });
  }

  // Парсинг лет жизни
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
