import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Textbook } from './textbook.entity';

@Injectable()
export class TextbooksService {
  constructor(
    @InjectRepository(Textbook)
    private readonly textbookRepo: Repository<Textbook>,
  ) {}

  async getAll() {
    return this.textbookRepo.find();
  }

  async getById(id: number) {
    const book = await this.textbookRepo.findOne({ where: { id } });
    if (!book) throw new NotFoundException('Учебник не найден');
    return book;
  }

  async getRandom() {
    const books = await this.textbookRepo
      .createQueryBuilder('t')
      .where('t.pdf_url IS NOT NULL')
      .orderBy('RANDOM()')
      .limit(1)
      .getMany();

    if (!books.length) throw new NotFoundException('Нет учебников с PDF');
    return books[0];
  }

  async create(data: Partial<Textbook>) {
    const book = this.textbookRepo.create(data);
    return this.textbookRepo.save(book);
  }

  async update(id: number, data: Partial<Textbook>) {
    const book = await this.textbookRepo.preload({ id, ...data });
    if (!book) throw new NotFoundException('Учебник не найден');
    return this.textbookRepo.save(book);
  }

  async remove(id: number) {
    const book = await this.textbookRepo.findOne({ where: { id } });
    if (!book) throw new NotFoundException('Учебник не найден');
    await this.textbookRepo.remove(book);
    return { message: 'Учебник удалён' };
  }
}
