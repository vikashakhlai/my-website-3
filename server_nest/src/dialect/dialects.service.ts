import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Dialect } from './dialect.entity';

@Injectable()
export class DialectsService {
  constructor(
    @InjectRepository(Dialect)
    private readonly dialectRepository: Repository<Dialect>,
  ) {}

  async findAll(query: {
    page?: number | string;
    limit?: number | string;
    name?: string;
    region?: string;
  }): Promise<{ data: Dialect[]; total: number; totalPages: number }> {
    const pageNum = Number(query.page);
    const limitNum = Number(query.limit);

    const page = !isNaN(pageNum) && pageNum > 0 ? pageNum : 1;
    const limit = !isNaN(limitNum) && limitNum > 0 ? limitNum : 10;
    const maxLimit = 100;
    const actualLimit = Math.min(limit, maxLimit);

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
      skip: (page - 1) * actualLimit,
      take: actualLimit,
      relations: ['medias'],
    });

    return {
      data,
      total,
      totalPages: Math.ceil(total / actualLimit),
    };
  }

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

  async create(data: Partial<Dialect>): Promise<Dialect> {
    const newDialect = this.dialectRepository.create(data);
    return await this.dialectRepository.save(newDialect);
  }

  async update(id: number, data: Partial<Dialect>): Promise<Dialect> {
    const dialect = await this.findOne(id);
    Object.assign(dialect, data);
    return await this.dialectRepository.save(dialect);
  }

  async remove(id: number): Promise<void> {
    const dialect = await this.findOne(id);
    await this.dialectRepository.remove(dialect);
  }
}
