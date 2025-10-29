import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './comment.entity';
import { CommentReaction } from './comment-reaction.entity';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { User } from 'src/user/user.entity';
import { Notification } from 'src/notifications/notification.entity';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment, User, Notification, CommentReaction]),
    JwtModule.register({}),
    forwardRef(() => NotificationsModule), // ✅ чтобы избежать циклических зависимостей
  ],
  controllers: [CommentsController],
  providers: [CommentsService],
  exports: [CommentsService],
})
export class CommentsModule {}
