import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DialectTopic } from './dialect_topics.entity';

@Injectable()
export class DialectTopicsService {
  constructor(
    @InjectRepository(DialectTopic)
    private readonly topicsRepo: Repository<DialectTopic>,
  ) {}

  async findAll(): Promise<DialectTopic[]> {
    try {
      return await this.topicsRepo.find();
    } catch (error) {
      throw new InternalServerErrorException('Ошибка при получении списка тем');
    }
  }

  async findOne(id: number): Promise<DialectTopic> {
    if (!id || id <= 0) {
      throw new BadRequestException('ID темы должен быть положительным числом');
    }

    try {
      const topic = await this.topicsRepo.findOne({
        where: { id },
        relations: ['medias'],
      });

      if (!topic) {
        throw new NotFoundException('Тема не найдена');
      }

      return topic;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Ошибка при поиске темы');
    }
  }

  async create(name: string) {
    if (!name || typeof name !== 'string' || name.trim() === '') {
      throw new BadRequestException('Название темы обязательно');
    }

    try {
      const existing = await this.topicsRepo.findOne({
        where: { name: name.trim().toLowerCase() },
      });

      if (existing) {
        throw new BadRequestException('Тема с таким названием уже существует');
      }

      const topic = this.topicsRepo.create({ name: name.trim() });
      return await this.topicsRepo.save(topic);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Ошибка при создании темы');
    }
  }

  async update(id: number, name: string) {
    if (!id || id <= 0) {
      throw new BadRequestException('ID темы должен быть положительным числом');
    }

    if (!name || typeof name !== 'string' || name.trim() === '') {
      throw new BadRequestException('Название темы обязательно');
    }

    try {
      const topic = await this.topicsRepo.findOne({ where: { id } });
      if (!topic) {
        throw new NotFoundException('Тема не найдена');
      }
      topic.name = name;
      return await this.topicsRepo.save(topic);
    } catch (error) {
      throw new BadRequestException('Тема с таким названием уже существует');
    }
  }

  async remove(id: number) {
    if (!id || id <= 0) {
      throw new BadRequestException('ID темы должен быть положительным числом');
    }

    try {
      const topic = await this.topicsRepo.findOne({ where: { id } });
      if (!topic) {
        throw new NotFoundException('Тема не найдена');
      }
      await this.topicsRepo.remove(topic);
      return { success: true };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Ошибка при удалении темы');
    }
  }
}
