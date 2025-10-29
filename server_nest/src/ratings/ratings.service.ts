import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rating } from './rating.entity';
import { CreateRatingDto } from './dto/create-rating.dto';
import { User } from 'src/user/user.entity';

@Injectable()
export class RatingsService {
  constructor(
    @InjectRepository(Rating)
    private readonly ratingRepository: Repository<Rating>,
  ) {}

  // --- Создать или обновить рейтинг ---
  async createOrUpdate(dto: CreateRatingDto, user: User): Promise<Rating> {
    if (dto.value < 1 || dto.value > 5) {
      throw new BadRequestException('Значение рейтинга должно быть от 1 до 5');
    }

    const existing = await this.ratingRepository.findOne({
      where: {
        user_id: user.id,
        target_type: dto.target_type,
        target_id: dto.target_id,
      },
    });

    if (existing) {
      existing.value = dto.value;
      existing.updated_at = new Date();
      return this.ratingRepository.save(existing);
    }

    const rating = this.ratingRepository.create({
      ...dto,
      user,
      user_id: user.id,
    });

    return this.ratingRepository.save(rating);
  }

  // --- Получить все рейтинги по объекту ---
  async findByTarget(
    target_type: 'book' | 'article' | 'media' | 'personality' | 'textbook',
    target_id: number,
  ): Promise<Rating[]> {
    return this.ratingRepository.find({
      where: { target_type, target_id },
      relations: ['user'],
      order: { created_at: 'DESC' },
    });
  }

  // --- Получить средний рейтинг и количество голосов ---
  async getAverage(
    target_type: 'book' | 'article' | 'media' | 'personality' | 'textbook',
    target_id: number,
  ): Promise<{ average: number; votes: number }> {
    const { avg, count } = await this.ratingRepository
      .createQueryBuilder('rating')
      .select('AVG(rating.value)', 'avg')
      .addSelect('COUNT(rating.id)', 'count')
      .where('rating.target_type = :target_type', { target_type })
      .andWhere('rating.target_id = :target_id', { target_id })
      .getRawOne();

    const average = avg ? parseFloat(avg).toFixed(2) : 0;
    const votes = parseInt(count, 10) || 0;
    return { average: Number(average), votes };
  }

  // --- Удалить рейтинг (только автор или админ) ---
  async delete(id: number, user: User): Promise<void> {
    const rating = await this.ratingRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!rating) throw new NotFoundException('Рейтинг не найден');

    if (rating.user.id !== user.id && user.role !== 'ADMIN') {
      throw new NotFoundException('Вы не можете удалить этот рейтинг');
    }

    await this.ratingRepository.remove(rating);
  }
}
