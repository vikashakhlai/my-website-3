import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsRelations } from 'typeorm';
import { Quote } from './quote.entity';
import { Personality } from 'src/personalities/personality.entity';

@Injectable()
export class QuotesService {
  constructor(
    @InjectRepository(Quote)
    private readonly quoteRepo: Repository<Quote>,
  ) {}

  // 🔹 Все цитаты
  async findAll() {
    const relations: FindOptionsRelations<Quote> = { personality: true };
    return this.quoteRepo.find({ relations });
  }

  // 🔹 Случайные цитаты
  async findRandom(limit = 2) {
    return this.quoteRepo
      .createQueryBuilder('q')
      .leftJoinAndSelect('q.personality', 'p')
      .orderBy('RANDOM()')
      .limit(limit)
      .getMany();
  }

  // 🔹 Создать новую цитату
  async create(text_ar: string, text_ru: string, personalityId?: number) {
    const quote = this.quoteRepo.create({
      text_ar,
      text_ru,
    });

    // 💡 безопасно подставляем связь через Reference Object
    if (personalityId) {
      (quote as any).personality = { id: personalityId } as Personality;
    }

    return this.quoteRepo.save(quote);
  }
}
