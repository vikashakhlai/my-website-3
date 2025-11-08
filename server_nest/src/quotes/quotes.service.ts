import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Personality } from 'src/personalities/personality.entity';
import { Repository } from 'typeorm';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { Quote } from './quote.entity';

@Injectable()
export class QuotesService {
  constructor(
    @InjectRepository(Quote)
    private readonly quoteRepo: Repository<Quote>,
  ) {}

  async findAll(): Promise<Quote[]> {
    try {
      return await this.quoteRepo.find({ relations: ['personality'] });
    } catch (error) {
      throw new InternalServerErrorException(
        'Ошибка при получении списка цитат',
      );
    }
  }

  async getRandomMapped(limit = 2) {
    if (limit <= 0) {
      throw new BadRequestException('Лимит должен быть положительным числом ');
    }

    try {
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
              full_name: q.personality.name,
              position: q.personality.position,
            }
          : null,
      }));
    } catch (error) {
      throw new InternalServerErrorException(
        'Ошибка при получении случайных цитат',
      );
    }
  }

  async findByPersonality(personalityId: number): Promise<Quote[]> {
    if (!personalityId || personalityId <= 0) {
      throw new BadRequestException(
        'ID личности должен быть положительным числом',
      );
    }

    try {
      return await this.quoteRepo.find({
        where: { personality_id: personalityId },
        relations: ['personality'],
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Ошибка при поиске цитат по личности',
      );
    }
  }

  async create(dto: CreateQuoteDto): Promise<Quote> {
    if (!dto || Object.keys(dto).length === 0) {
      throw new BadRequestException('Данные цитаты обязательны');
    }

    if (
      !dto.text_ar ||
      typeof dto.text_ar !== 'string' ||
      dto.text_ar.trim() === ''
    ) {
      throw new BadRequestException('Арабский текст цитаты обязателен');
    }

    if (dto.text_ar.length > 2000) {
      throw new BadRequestException(
        'Арабский текст цитаты слишком длинный (максимум 2000 символов)',
      );
    }

    if (dto.text_ru && typeof dto.text_ru !== 'string') {
      throw new BadRequestException('Русский текст должен быть строкой');
    }

    if (dto.text_ru && dto.text_ru.length > 2000) {
      throw new BadRequestException(
        'Русский текст цитаты слишком длинный (максимум 2000 символов)',
      );
    }

    if (
      dto.personalityId &&
      (typeof dto.personalityId !== 'number' || dto.personalityId <= 0)
    ) {
      throw new BadRequestException(
        'ID личности должен быть положительным числом',
      );
    }

    try {
      const quote = this.quoteRepo.create({
        text_ar: dto.text_ar.trim(),
        text_ru: dto.text_ru ? dto.text_ru.trim() : null,
        personality: dto.personalityId
          ? ({ id: dto.personalityId } as Personality)
          : null,
      });

      return await this.quoteRepo.save(quote);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Ошибка при создании цитаты');
    }
  }

  async update(id: number, dto: UpdateQuoteDto): Promise<Quote> {
    if (!id || id <= 0) {
      throw new BadRequestException(
        'ID цитаты должен быть положительным числом',
      );
    }

    if (!dto || Object.keys(dto).length === 0) {
      throw new BadRequestException('Нет данных для обновления');
    }

    try {
      const quote = await this.quoteRepo.findOne({ where: { id } });
      if (!quote) {
        throw new NotFoundException('Цитата не найдена');
      }

      if (dto.text_ar !== undefined) {
        if (typeof dto.text_ar !== 'string' || dto.text_ar.trim() === '') {
          throw new BadRequestException('Арабский текст цитаты обязателен');
        }

        if (dto.text_ar.length > 2000) {
          throw new BadRequestException(
            'Арабский текст цитаты слишком длинный (максимум 2000 символов)',
          );
        }

        quote.text_ar = dto.text_ar.trim();
      }

      if (dto.text_ru !== undefined) {
        if (typeof dto.text_ru !== 'string') {
          throw new BadRequestException('Русский текст должен быть строкой');
        }

        if (dto.text_ru.length > 2000) {
          throw new BadRequestException(
            'Русский текст цитаты слишком длинный (максимум 2000 символов)',
          );
        }

        quote.text_ru = dto.text_ru.trim();
      }

      if ('personalityId' in dto) {
        if (
          dto.personalityId &&
          (typeof dto.personalityId !== 'number' || dto.personalityId <= 0)
        ) {
          throw new BadRequestException(
            'ID личности должен быть положительным числом',
          );
        }

        quote.personality = dto.personalityId
          ? ({ id: dto.personalityId } as Personality)
          : null;
      }

      return await this.quoteRepo.save(quote);
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Ошибка при обновлении цитаты');
    }
  }

  async delete(id: number): Promise<{ message: string }> {
    if (!id || id <= 0) {
      throw new BadRequestException(
        'ID цитаты должен быть положительным числом',
      );
    }

    try {
      const quote = await this.quoteRepo.findOne({ where: { id } });
      if (!quote) {
        throw new NotFoundException('Цитата не найдена');
      }

      await this.quoteRepo.remove(quote);
      return { message: `Цитата #${id} удалена` };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Ошибка при удалении цитаты');
    }
  }
}
