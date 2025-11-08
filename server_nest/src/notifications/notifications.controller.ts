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
import { ApiTags, ApiOperation, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('Notifications')
@ApiBearerAuth('access-token')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // --- Получить все уведомления пользователя ---
  @ApiOperation({ summary: 'Получить все уведомления пользователя' })
  @Get()
  async getAll(@Request() req) {
    const user = req.user;
    return this.notificationsService.findForUser(user);
  }

  // --- Пометить уведомление как прочитанное ---
  @ApiOperation({ summary: 'Пометить уведомление как прочитанное' })
  @ApiParam({
    name: 'id',
    description: 'Уникальный идентификатор уведомления',
    type: Number,
    example: 1,
  })
  @Patch(':id/read')
  async markAsRead(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const user = req.user;
    return this.notificationsService.markAsRead(id, user);
  }

  // --- Пометить все уведомления как прочитанные ---
  @ApiOperation({ summary: 'Пометить все уведомления как прочитанные' })
  @Patch('read/all')
  async markAllAsRead(@Request() req) {
    const user = req.user;
    await this.notificationsService.markAllAsRead(user);
    return { message: 'Все уведомления помечены как прочитанные' };
  }

  // --- Удалить уведомление ---
  @ApiOperation({ summary: 'Удалить уведомление' })
  @ApiParam({
    name: 'id',
    description: 'Уникальный идентификатор уведомления',
    type: Number,
    example: 1,
  })
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const user = req.user;
    return this.notificationsService.delete(id, user);
  }
}
