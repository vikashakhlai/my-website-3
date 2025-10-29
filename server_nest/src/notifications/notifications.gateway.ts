import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { NotificationsService } from './notifications.service';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from 'src/auth/constants';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/notifications',
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  private readonly connectedUsers = new Map<string, string>(); // userId -> socketId

  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly jwtService: JwtService,
  ) {}

  // === Подключение клиента ===
  handleConnection(client: Socket): void {
    try {
      const token = client.handshake.auth?.token as string | undefined;
      if (!token) {
        this.logger.warn('❌ Подключение без токена, разрыв соединения');
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify<{ sub: string }>(token, {
        secret: jwtConstants.secret,
      });

      if (!payload?.sub) {
        this.logger.warn('❌ JWT не содержит userId (sub)');
        client.disconnect();
        return;
      }

      this.connectedUsers.set(payload.sub, client.id);
      this.logger.log(
        `✅ Пользователь ${payload.sub} подключился к уведомлениям`,
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Ошибка JWT при подключении: ${message}`);
      client.disconnect();
    }
  }

  // === Отключение клиента ===
  handleDisconnect(client: Socket): void {
    const userId = [...this.connectedUsers.entries()].find(
      ([, socketId]) => socketId === client.id,
    )?.[0];

    if (userId) {
      this.connectedUsers.delete(userId);
      this.logger.log(`❎ Пользователь ${userId} отключился от уведомлений`);
    }
  }

  // === Отправка уведомления конкретному пользователю ===
  async sendNotificationToUser(
    userId: string,
    notification: unknown,
  ): Promise<void> {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.server.to(socketId).emit('newNotification', notification);
      this.logger.debug(`📨 Уведомление отправлено пользователю ${userId}`);
    } else {
      this.logger.warn(
        `⚠️ Пользователь ${userId} не подключен, уведомление не доставлено`,
      );
    }
  }

  // === Запрос всех уведомлений через WebSocket ===
  @SubscribeMessage('getNotifications')
  async handleGetNotifications(
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    try {
      const token = client.handshake.auth?.token as string | undefined;
      if (!token) throw new Error('Missing JWT token');

      const payload = this.jwtService.verify<{ sub: string }>(token, {
        secret: jwtConstants.secret,
      });

      if (!payload?.sub) throw new Error('Invalid JWT payload');

      const notifications = await this.notificationsService.findForUser({
        id: payload.sub,
      } as any);

      client.emit('notificationsList', notifications);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Ошибка получения уведомлений: ${message}`);
      client.emit('notificationsError', {
        message: 'Ошибка получения уведомлений',
      });
    }
  }
}
