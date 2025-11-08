import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Exercise } from 'src/articles/entities/exercise.entity';
import { CommentsModule } from 'src/comments/comments.module';
import { DialectTopicsModule } from 'src/dialect_topics/dialect_topics.module';
import { FavoritesModule } from 'src/favorites/favorites.module';
import { RatingsModule } from 'src/ratings/ratings.module';
import { MediaController } from './media.controller';
import { Media } from './media.entity';
import { MediaService } from './media.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Media, Exercise]),

    DialectTopicsModule,

    JwtModule.register({}),

    forwardRef(() => RatingsModule),
    forwardRef(() => CommentsModule),
    forwardRef(() => FavoritesModule),
  ],
  controllers: [MediaController],
  providers: [MediaService],
  exports: [MediaService],
})
export class MediaModule {}
