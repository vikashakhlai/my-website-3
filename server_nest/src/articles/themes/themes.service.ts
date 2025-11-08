import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Theme } from './theme.entity';

@Injectable()
export class ThemesService {
  constructor(
    @InjectRepository(Theme)
    private readonly themeRepository: Repository<Theme>,
  ) {}

  async findAll() {
    return this.themeRepository.find({
      order: { id: 'ASC' },
    });
  }

  async findBySlug(slug: string) {
    return this.themeRepository.findOne({ where: { slug } });
  }
}
