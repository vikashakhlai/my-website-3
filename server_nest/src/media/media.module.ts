import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Media } from './media.entity';
import { Exercise } from 'src/articles/entities/exercise.entity';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { DialectTopicsModule } from 'src/dialect_topics/dialect_topics.module';

import { RatingsModule } from 'src/ratings/ratings.module';
import { CommentsModule } from 'src/comments/comments.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Media, Exercise]),
    DialectTopicsModule,

    // ✅ Подключаем для поддержки рейтингов и комментариев
    RatingsModule,
    CommentsModule,
  ],
  controllers: [MediaController],
  providers: [MediaService],
  exports: [MediaService],
})
export class MediaModule {}
