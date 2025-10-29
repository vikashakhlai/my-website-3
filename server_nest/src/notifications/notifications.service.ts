import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';
import { User } from 'src/user/user.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  async findForUser(user: User): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: { recipient_id: user.id },
      order: { created_at: 'DESC' },
    });
  }

  async markAsRead(id: number, user: User): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id, recipient_id: user.id },
    });

    if (!notification) {
      throw new NotFoundException('Уведомление не найдено');
    }

    notification.is_read = true;
    return this.notificationRepository.save(notification);
  }

  async markAllAsRead(user: User): Promise<void> {
    await this.notificationRepository.update(
      { recipient_id: user.id, is_read: false },
      { is_read: true },
    );
  }

  async delete(id: number, user: User): Promise<void> {
    const notification = await this.notificationRepository.findOne({
      where: { id, recipient_id: user.id },
    });

    if (!notification) {
      throw new NotFoundException('Уведомление не найдено');
    }

    await this.notificationRepository.remove(notification);
  }
}
