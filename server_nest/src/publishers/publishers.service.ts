import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Publisher } from './publisher.entity';
import {
  CreatePublisherDto,
  UpdatePublisherDto,
} from './dto/create-publisher.dto';

@Injectable()
export class PublishersService {
  constructor(
    @InjectRepository(Publisher)
    private readonly publisherRepo: Repository<Publisher>,
  ) {}

  /**
   * Получить все издательства
   */
  async findAll(includeBooks = false) {
    return this.publisherRepo.find({
      relations: includeBooks ? ['books'] : [],
      order: { name: 'ASC' },
    });
  }

  /**
   * Получить одно издательство по ID
   */
  async findOne(id: number, includeBooks = false) {
    const publisher = await this.publisherRepo.findOne({
      where: { id },
      relations: includeBooks ? ['books'] : [],
    });

    if (!publisher) {
      throw new NotFoundException('Издательство не найдено');
    }

    return publisher;
  }

  /**
   * Создать новое издательство
   */
  async create(dto: CreatePublisherDto) {
    const publisher = this.publisherRepo.create(dto);
    return this.publisherRepo.save(publisher);
  }

  /**
   * Обновить издательство
   */
  async update(id: number, dto: UpdatePublisherDto) {
    const publisher = await this.publisherRepo.findOne({ where: { id } });

    if (!publisher) {
      throw new NotFoundException('Издательство не найдено');
    }

    Object.assign(publisher, dto);
    return this.publisherRepo.save(publisher);
  }

  /**
   * Удалить издательство
   */
  async remove(id: number) {
    const publisher = await this.publisherRepo.findOne({ where: { id } });

    if (!publisher) {
      throw new NotFoundException('Издательство не найдено');
    }

    await this.publisherRepo.remove(publisher);
    return { message: `Издательство #${id} удалено` };
  }
}
