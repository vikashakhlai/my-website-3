import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // --- Получить все уведомления пользователя ---
  @Get()
  async getAll(@Request() req) {
    const user = req.user;
    return this.notificationsService.findForUser(user);
  }

  // --- Пометить уведомление как прочитанное ---
  @Patch(':id/read')
  async markAsRead(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const user = req.user;
    return this.notificationsService.markAsRead(id, user);
  }

  // --- Пометить все уведомления как прочитанные ---
  @Patch('read/all')
  async markAllAsRead(@Request() req) {
    const user = req.user;
    await this.notificationsService.markAllAsRead(user);
    return { message: 'Все уведомления помечены как прочитанные' };
  }

  // --- Удалить уведомление ---
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const user = req.user;
    return this.notificationsService.delete(id, user);
  }
}
