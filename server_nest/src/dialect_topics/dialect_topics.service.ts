import { Injectable } from '@nestjs/common';
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
      relations: ['medias'], // можно сразу смотреть где используется
    });
  }

  async create(name: string) {
    const topic = this.topicsRepo.create({ name });
    return this.topicsRepo.save(topic);
  }
}
