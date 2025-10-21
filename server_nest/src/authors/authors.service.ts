import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Author } from './authors.entity';

@Injectable()
export class AuthorsService {
  constructor(
    @InjectRepository(Author)
    private readonly authorRepo: Repository<Author>,
  ) {}

  async findAll() {
    return this.authorRepo.find({
      order: { full_name: 'ASC' },
    });
  }

  async searchByName(name: string) {
    return this.authorRepo.find({
      where: { full_name: ILike(`%${name}%`) }, // 🔍 поиск без учёта регистра
      take: 10, // ограничим количество для автокомплита
      order: { full_name: 'ASC' },
    });
  }
}
