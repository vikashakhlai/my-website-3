import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quote } from './quote.entity';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { Personality } from 'src/personalities/personality.entity';

@Injectable()
export class QuotesService {
  constructor(
    @InjectRepository(Quote)
    private readonly quoteRepo: Repository<Quote>,
  ) {}

  async findAll() {
    return this.quoteRepo.find({ relations: ['personality'] });
  }

  async getRandomMapped(limit = 2) {
    const quotes = await this.quoteRepo
      .createQueryBuilder('q')
      .leftJoinAndSelect('q.personality', 'p')
      .orderBy('RANDOM()')
      .limit(limit)
      .getMany();

    return quotes.map((q) => ({
      id: q.id,
      text_ar: q.text_ar,
      text_ru: q.text_ru,
      personality: q.personality
        ? {
            id: q.personality.id,
            name: q.personality.name,
            position: q.personality.position,
          }
        : null,
    }));
  }

  async findByPersonality(personalityId: number) {
    return this.quoteRepo.find({
      where: { personality: { id: personalityId } },
      relations: ['personality'],
    });
  }

  async create(dto: CreateQuoteDto) {
    const quote = this.quoteRepo.create({
      text_ar: dto.text_ar,
      text_ru: dto.text_ru ?? null,
      personality: dto.personalityId
        ? ({ id: dto.personalityId } as Personality)
        : null,
    });

    return this.quoteRepo.save(quote);
  }

  async update(id: number, dto: UpdateQuoteDto) {
    const quote = await this.quoteRepo.findOne({ where: { id } });
    if (!quote) throw new NotFoundException('Цитата не найдена');

    if (dto.text_ar !== undefined) quote.text_ar = dto.text_ar;
    if (dto.text_ru !== undefined) quote.text_ru = dto.text_ru;

    // ⚡ обновляем личность ТОЛЬКО если поле пришло
    if ('personalityId' in dto) {
      quote.personality = dto.personalityId
        ? ({ id: dto.personalityId } as Personality)
        : null; // явный null — значит удалить связь
    }

    return this.quoteRepo.save(quote);
  }

  async delete(id: number) {
    const quote = await this.quoteRepo.findOne({ where: { id } });
    if (!quote) throw new NotFoundException('Цитата не найдена');

    await this.quoteRepo.remove(quote);
    return { message: `Цитата #${id} удалена` };
  }
}
