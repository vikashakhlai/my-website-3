import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
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
    try {
      const pageNum = Number(query.page);
      const limitNum = Number(query.limit);

      const page = !isNaN(pageNum) && pageNum > 0 ? pageNum : 1;
      const limit = !isNaN(limitNum) && limitNum > 0 ? limitNum : 10;
      const maxLimit = 100;
      const actualLimit = Math.min(limit, maxLimit);

      if (query.name && typeof query.name !== 'string') {
        throw new BadRequestException('Параметр name должен быть строкой');
      }

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
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Ошибка при получении списка диалектов',
      );
    }
  }

  async findOne(id: number): Promise<Dialect> {
    if (!id || id <= 0) {
      throw new BadRequestException(
        'ID диалекта должен быть положительным числом',
      );
    }

    try {
      const dialect = await this.dialectRepository.findOne({
        where: { id },
        relations: ['medias'],
      });

      if (!dialect) {
        throw new NotFoundException(`Диалект с ID ${id} не найден`);
      }

      return dialect;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Ошибка при поиске диалекта');
    }
  }

  async create(data: Partial<Dialect>): Promise<Dialect> {
    if (!data || Object.keys(data).length === 0) {
      throw new BadRequestException('Данные диалекта обязательны');
    }

    try {
      const newDialect = this.dialectRepository.create(data);
      return await this.dialectRepository.save(newDialect);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Ошибка при создании диалекта');
    }
  }

  async update(id: number, data: Partial<Dialect>): Promise<Dialect> {
    if (!id || id <= 0) {
      throw new BadRequestException(
        'ID диалекта должен быть положительным числом',
      );
    }

    if (!data || Object.keys(data).length === 0) {
      throw new BadRequestException('Нет данных для обновления');
    }

    try {
      const dialect = await this.findOne(id);

      if (!dialect) {
        throw new NotFoundException(`Диалект с ID ${id} не найден`);
      }

      Object.assign(dialect, data);
      return await this.dialectRepository.save(dialect);
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Ошибка при обновлении диалекта');
    }
  }

  async remove(id: number): Promise<void> {
    if (!id || id <= 0) {
      throw new BadRequestException(
        'ID диалекта должен быть положительным числом',
      );
    }

    try {
      const dialect = await this.findOne(id);

      if (!dialect) {
        throw new NotFoundException(`Диалект с ID ${id} не найден`);
      }

      await this.dialectRepository.remove(dialect);
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Ошибка при удалении диалекта');
    }
  }
}
