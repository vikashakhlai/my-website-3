import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Personality } from './personality.entity';
import { PersonalitiesService } from './personalities.service';
import { PersonalitiesController } from './personalities.controller';

import { CommentsModule } from 'src/comments/comments.module';
import { RatingsModule } from 'src/ratings/ratings.module';
import { FavoritesModule } from 'src/favorites/favorites.module';

import { Comment } from 'src/comments/comment.entity';
import { Rating } from 'src/ratings/rating.entity';
import { Favorite } from 'src/favorites/favorite.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Personality, Comment, Rating, Favorite]),

    CommentsModule,
    RatingsModule,

    // ✅ обязательно через forwardRef, чтобы разорвать цикл!
    forwardRef(() => FavoritesModule),
  ],
  controllers: [PersonalitiesController],
  providers: [PersonalitiesService],
  exports: [PersonalitiesService],
})
export class PersonalitiesModule {}
