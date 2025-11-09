import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  async findForUser(user: User): Promise<Notification[]> {
    try {
      return this.notificationRepository.find({
        where: { recipient_id: user.id },
        order: { created_at: 'DESC' },
        select: {
          id: true,
          type: true,
          entity_type: true,
          entity_id: true,
          message: true,
          is_read: true,
          created_at: true,
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
        'Ошибка при получении уведомлений',
      );
    }
  }

  async markAsRead(id: number, user: User): Promise<Notification> {
    if (!id || id <= 0) {
      throw new BadRequestException(
        'ID уведомления должен быть положительным числом',
      );
    }

    try {
      const notification = await this.notificationRepository.findOne({
        where: { id, recipient_id: user.id },
      });

      if (!notification) {
        throw new NotFoundException(
          'Уведомление не найдено или не принадлежит пользователю',
        );
      }

      notification.is_read = true;
      return await this.notificationRepository.save(notification);
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Ошибка при пометке уведомления как прочитанного',
      );
    }
  }

  async markAllAsRead(user: User): Promise<{ marked: number }> {
    try {
      const result = await this.notificationRepository.update(
        { recipient_id: user.id, is_read: false },
        { is_read: true },
      );

      return { marked: result.affected || 0 };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Ошибка при пометке всех уведомлений как прочитанных',
      );
    }
  }

  async delete(id: number, user: User): Promise<void> {
    if (!id || id <= 0) {
      throw new BadRequestException(
        'ID уведомления должен быть положительным числом',
      );
    }

    if (!user || !user.id) {
      throw new BadRequestException('Пользователь должен быть авторизован');
    }

    try {
      const notification = await this.notificationRepository.findOne({
        where: { id, recipient_id: user.id },
      });

      if (!notification) {
        throw new NotFoundException(
          'Уведомление не найдено или не принадлежит пользователю',
        );
      }

      await this.notificationRepository.remove(notification);
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Ошибка при удалении уведомления');
    }
  }
}
