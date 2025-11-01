// src/ratings/ratings.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Rating } from './rating.entity';
import { CreateRatingDto } from './dto/create-rating.dto';
import { User } from 'src/user/user.entity';
import { Role } from 'src/auth/roles.enum';
import { TargetType } from 'src/common/enums/target-type.enum';

@Injectable()
export class RatingsService {
  constructor(
    @InjectRepository(Rating)
    private readonly ratingRepository: Repository<Rating>,
  ) {}

  /** ✅ Создать или обновить рейтинг */
  async createOrUpdate(dto: CreateRatingDto, user: User): Promise<Rating> {
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

  /** ✅ Получить все рейтинги для сущности */
  async findByTarget(
    target_type: TargetType,
    target_id: number,
  ): Promise<Rating[]> {
    return this.ratingRepository.find({
      where: { target_type, target_id },
      relations: ['user'],
      order: { created_at: 'DESC' },
    });
  }

  /** ✅ Средний рейтинг + число голосов */
  async getAverage(
    target_type: TargetType,
    target_id: number,
  ): Promise<{ average: number; votes: number }> {
    const { avg, count } = await this.ratingRepository
      .createQueryBuilder('rating')
      .select('AVG(rating.value)', 'avg')
      .addSelect('COUNT(rating.id)', 'count')
      .where('rating.target_type = :target_type', { target_type })
      .andWhere('rating.target_id = :target_id', { target_id })
      .getRawOne();

    return {
      average: avg ? Number(parseFloat(avg).toFixed(2)) : 0,
      votes: count ? Number(count) : 0,
    };
  }

  /** ✅ Удалить рейтинг (только свой, или SUPER_ADMIN) */
  async delete(id: number, user: User): Promise<void> {
    const rating = await this.ratingRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!rating) throw new NotFoundException('Рейтинг не найден');

    const isOwner = rating.user.id === user.id;
    const isSuperAdmin = user.role === Role.SUPER_ADMIN;

    if (!isOwner && !isSuperAdmin) {
      throw new ForbiddenException(
        'Вы можете удалять только свой рейтинг. SUPER_ADMIN может удалять любой.',
      );
    }

    await this.ratingRepository.remove(rating);
  }
}
