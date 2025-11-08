import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DialectTopic } from './dialect_topics.entity';

@Injectable()
export class DialectTopicsService {
  constructor(
    @InjectRepository(DialectTopic)
    private readonly topicsRepo: Repository<DialectTopic>,
  ) {}

  findAll() {
    return this.topicsRepo.find();
  }

  findOne(id: number) {
    return this.topicsRepo.findOne({
      where: { id },
      relations: ['medias'],
    });
  }

  async create(name: string) {
    const topic = this.topicsRepo.create({ name });
    return await this.topicsRepo.save(topic);
  }

  async update(id: number, name: string) {
    const topic = await this.topicsRepo.findOne({ where: { id } });
    if (!topic) {
      throw new NotFoundException('Тема не найдена');
    }
    topic.name = name;
    return await this.topicsRepo.save(topic);
  }

  async remove(id: number) {
    const topic = await this.topicsRepo.findOne({ where: { id } });
    if (!topic) {
      throw new NotFoundException('Тема не найдена');
    }
    await this.topicsRepo.remove(topic);
    return { success: true };
  }
}
