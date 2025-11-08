import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Request,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { NotificationResponseDto } from './dto/notification-response.dto';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @ApiOperation({ summary: 'Получить все уведомления пользователя' })
  @ApiBearerAuth('access-token')
  @Auth()
  @ApiResponse({
    status: 200,
    description: 'Список уведомлений',
    type: [NotificationResponseDto],
  })
  @Get()
  async getAll(@Request() req) {
    const user = req.user;
    return this.notificationsService.findForUser(user);
  }

  @ApiOperation({ summary: 'Пометить уведомление как прочитанное' })
  @ApiBearerAuth('access-token')
  @Auth()
  @ApiResponse({
    status: 200,
    description: 'Уведомление обновлено',
    type: NotificationResponseDto,
  })
  @Patch(':id/read')
  async markAsRead(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const user = req.user;
    return this.notificationsService.markAsRead(id, user);
  }

  @ApiOperation({ summary: 'Пометить все уведомления как прочитанные' })
  @ApiBearerAuth('access-token')
  @Auth()
  @ApiResponse({
    status: 200,
    description: 'Все уведомления помечены как прочитанные',
    type: Object,
  })
  @Patch('read/all')
  async markAllAsRead(@Request() req) {
    const user = req.user;
    await this.notificationsService.markAllAsRead(user);
    return { message: 'Все уведомления помечены как прочитанные' };
  }

  @ApiOperation({ summary: 'Удалить уведомление' })
  @ApiBearerAuth('access-token')
  @Auth()
  @ApiResponse({
    status: 200,
    description: 'Уведомление удалено',
    type: Object,
  })
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const user = req.user;
    await this.notificationsService.delete(id, user);
    return { message: 'Уведомление удалено' };
  }
}
