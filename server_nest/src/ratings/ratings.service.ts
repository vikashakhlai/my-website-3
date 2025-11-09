import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Role } from 'src/auth/roles.enum';
import { TargetType } from 'src/common/enums/target-type.enum';
import { User } from 'src/user/user.entity';
import { CreateRatingDto } from './dto/create-rating.dto';
import { Rating } from './rating.entity';

export interface AverageRatingResult {
  average: number;
  votes: number;
}

@Injectable()
export class RatingsService {
  constructor(
    @InjectRepository(Rating)
    private readonly ratingRepository: Repository<Rating>,
  ) {}

  async createOrUpdate(dto: CreateRatingDto, user: User): Promise<Rating> {
    if (!dto || !user) {
      throw new BadRequestException(
        'Данные рейтинга и пользователь обязательны',
      );
    }

    if (typeof dto.value !== 'number' || dto.value < 1 || dto.value > 5) {
      throw new BadRequestException(
        'Значение рейтинга должно быть числом от 1 до 5',
      );
    }

    if (!Object.values(TargetType).includes(dto.target_type)) {
      throw new BadRequestException(
        `Некорректный тип цели. Допустимые значения: ${Object.values(TargetType).join(', ')}`,
      );
    }

    if (!dto.target_id || dto.target_id <= 0) {
      throw new BadRequestException('ID цели должен быть положительным числом');
    }

    if (!user.id) {
      throw new BadRequestException('Пользователь должен быть авторизован');
    }

    try {
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
        return await this.ratingRepository.save(existing);
      }

      const rating = this.ratingRepository.create({
        ...dto,
        user,
        user_id: user.id,
      });

      return await this.ratingRepository.save(rating);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Ошибка при создании или обновлении рейтинга',
      );
    }
  }

  async findByTarget(
    target_type: TargetType,
    target_id: number,
  ): Promise<Rating[]> {
    if (!Object.values(TargetType).includes(target_type)) {
      throw new BadRequestException(
        `Некорректный тип цели. Допустимые значения: ${Object.values(TargetType).join(', ')}`,
      );
    }

    if (!target_id || target_id <= 0) {
      throw new BadRequestException('ID цели должен быть положительным числом');
    }

    try {
      return await this.ratingRepository.find({
        where: { target_type, target_id },
        relations: ['user'],
        order: { created_at: 'DESC' },
        select: {
          user: {
            id: true,
            email: true,
            role: true,
            isAuthor: true,
          },
        },
      });
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Ошибка при получении рейтингов для цели',
      );
    }
  }

  async getAverage(
    target_type: TargetType,
    target_id: number,
  ): Promise<AverageRatingResult> {
    if (!Object.values(TargetType).includes(target_type)) {
      throw new BadRequestException(
        `Некорректный тип цели. Допустимые значения: ${Object.values(TargetType).join(', ')}`,
      );
    }

    if (!target_id || target_id <= 0) {
      throw new BadRequestException('ID цели должен быть положительным числом');
    }

    try {
      const result = await this.ratingRepository
        .createQueryBuilder('rating')
        .select('AVG(rating.value)', 'avg')
        .addSelect('COUNT(rating.id)', 'count')
        .where('rating.target_type = :target_type', { target_type })
        .andWhere('rating.target_id = :target_id', { target_id })
        .getRawOne<{ avg: string | null; count: string | null }>();

      const average = result?.avg
        ? Number(parseFloat(result.avg).toFixed(2))
        : 0;
      const votes = result?.count ? Number(result.count) : 0;

      return {
        average,
        votes,
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Ошибка при вычислении среднего рейтинга',
      );
    }
  }

  async delete(id: number, user: User): Promise<void> {
    if (!id || id <= 0) {
      throw new BadRequestException(
        'ID рейтинга должен быть положительным числом',
      );
    }

    if (!user || !user.id) {
      throw new BadRequestException('Пользователь должен быть авторизован');
    }

    try {
      const rating = await this.ratingRepository.findOne({
        where: { id },
        relations: ['user'],
      });

      if (!rating) {
        throw new NotFoundException('Рейтинг не найден');
      }

      const isOwner = rating.user_id === user.id;
      const isSuperAdmin = user.role === Role.SUPER_ADMIN;
      const isAdmin = user.role === Role.ADMIN;

      if (!isOwner && !isSuperAdmin && !isAdmin) {
        throw new ForbiddenException(
          'Вы можете удалять только свой рейтинг. ADMIN и SUPER_ADMIN могут удалять любой.',
        );
      }

      await this.ratingRepository.remove(rating);
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Ошибка при удалении рейтинга');
    }
  }
}
