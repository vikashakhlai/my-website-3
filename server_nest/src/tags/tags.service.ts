import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { Tag } from './tags.entity';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private readonly tagRepo: Repository<Tag>,
  ) {}

  async findAll(): Promise<Partial<Tag>[]> {
    try {
      return await this.tagRepo.find({
        order: { name: 'ASC' },
        select: ['id', 'name', 'createdAt', 'updatedAt'],
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Ошибка при получении списка тегов',
      );
    }
  }

  async create(dto: CreateTagDto): Promise<Tag> {
    if (!dto || !dto.name) {
      throw new BadRequestException('Название тега обязательно');
    }

    const trimmedName = dto.name.trim();
    if (trimmedName.length === 0) {
      throw new BadRequestException('Название тега не может быть пустым');
    }

    if (trimmedName.length > 100) {
      throw new BadRequestException(
        'Название тега слишком длинное (максимум 100 символов)',
      );
    }

    try {
      const existing = await this.tagRepo.findOne({
        where: { name: trimmedName.toLowerCase() },
      });

      if (existing) {
        throw new BadRequestException('Тег с таким названием уже существует');
      }

      const tag = this.tagRepo.create({
        ...dto,
        name: trimmedName.toLowerCase(),
      });

      return await this.tagRepo.save(tag);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Ошибка при создании тега');
    }
  }

  async update(id: number, dto: UpdateTagDto): Promise<Tag> {
    if (!id || id <= 0) {
      throw new BadRequestException('ID тега должен быть положительным числом');
    }

    if (!dto || Object.keys(dto).length === 0) {
      throw new BadRequestException('Нет данных для обновления');
    }

    try {
      const tag = await this.tagRepo.findOne({ where: { id } });
      if (!tag) {
        throw new NotFoundException('Тег не найден');
      }

      if (dto.name !== undefined) {
        const trimmedName = dto.name.trim();

        if (trimmedName.length === 0) {
          throw new BadRequestException('Название тега не может быть пустым');
        }

        if (trimmedName.length > 100) {
          throw new BadRequestException(
            'Название тега слишком длинное (максимум 100 символов)',
          );
        }

        const duplicate = await this.tagRepo.findOne({
          where: { name: trimmedName.toLowerCase() },
        });

        if (duplicate && duplicate.id !== id) {
          throw new BadRequestException('Тег с таким названием уже существует');
        }

        tag.name = trimmedName.toLowerCase();
      }

      Object.assign(tag, { ...dto, name: undefined });

      return await this.tagRepo.save(tag);
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Ошибка при обновлении тега');
    }
  }

  async remove(id: number): Promise<{ message: string }> {
    if (!id || id <= 0) {
      throw new BadRequestException('ID тега должен быть положительным числом');
    }

    try {
      const tag = await this.tagRepo.findOne({ where: { id } });
      if (!tag) {
        throw new NotFoundException('Тег не найден');
      }

      await this.tagRepo.remove(tag);
      return { message: `Тег "${tag.name}" удален` };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Ошибка при удалении тега');
    }
  }
}
