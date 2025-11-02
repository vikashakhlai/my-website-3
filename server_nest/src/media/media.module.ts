import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Media } from './media.entity';
import { Exercise } from 'src/articles/entities/exercise.entity';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { DialectTopicsModule } from 'src/dialect_topics/dialect_topics.module';
import { RatingsModule } from 'src/ratings/ratings.module';
import { CommentsModule } from 'src/comments/comments.module';
import { FavoritesModule } from 'src/favorites/favorites.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([Media, Exercise]),

    DialectTopicsModule,

    JwtModule.register({}),

    forwardRef(() => RatingsModule),
    forwardRef(() => CommentsModule),
    forwardRef(() => FavoritesModule), // ✅ добавлено
  ],
  controllers: [MediaController],
  providers: [MediaService],
  exports: [MediaService],
})
export class MediaModule {}
