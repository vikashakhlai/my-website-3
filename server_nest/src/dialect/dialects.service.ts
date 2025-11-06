import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Dialect } from './dialect.entity';

@Injectable()
export class DialectsService {
  constructor(
    @InjectRepository(Dialect)
    private readonly dialectRepository: Repository<Dialect>,
  ) {}

  /** 📜 Получить все диалекты с фильтрацией и пагинацией */
  async findAll(query: {
    page?: number | string;
    limit?: number | string;
    name?: string;
    region?: string;
  }): Promise<{ data: Dialect[]; total: number; totalPages: number }> {
    // ✅ Преобразуем и валидируем
    const pageNum = Number(query.page);
    const limitNum = Number(query.limit);

    const page = !isNaN(pageNum) && pageNum > 0 ? pageNum : 1;
    const limit = !isNaN(limitNum) && limitNum > 0 ? limitNum : 10;

    const where: Record<string, any> = {};

    if (query.name?.trim()) {
      where.name = ILike(`%${query.name.trim()}%`);
    }

    if (query.region?.trim()) {
      where.region = ILike(`%${query.region.trim()}%`);
    }

    const [data, total] = await this.dialectRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit, // ✅ гарантированно число
      take: limit,
      relations: ['medias'],
    });

    return {
      data,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getRegions(): Promise<string[]> {
    const rows = await this.dialectRepository
      .createQueryBuilder('d')
      .select('DISTINCT d.region', 'region')
      .where("d.region IS NOT NULL AND d.region != ''")
      .orderBy('d.region', 'ASC')
      .getRawMany<{ region: string }>();

    return rows.map((r) => r.region);
  }

  /** 🔍 Получить один диалект по ID */
  async findOne(id: number): Promise<Dialect> {
    const dialect = await this.dialectRepository.findOne({
      where: { id },
      relations: ['medias'],
    });

    if (!dialect) {
      throw new NotFoundException(`Диалект с ID ${id} не найден`);
    }
    return dialect;
  }

  /** ➕ Создать */
  async create(data: Partial<Dialect>): Promise<Dialect> {
    const newDialect = this.dialectRepository.create(data);
    return this.dialectRepository.save(newDialect);
  }

  /** ♻️ Обновить */
  async update(id: number, data: Partial<Dialect>): Promise<Dialect> {
    const dialect = await this.findOne(id);
    Object.assign(dialect, data);
    return this.dialectRepository.save(dialect);
  }

  /** 🗑 Удалить */
  async remove(id: number): Promise<void> {
    const dialect = await this.findOne(id);
    await this.dialectRepository.remove(dialect);
  }
}
