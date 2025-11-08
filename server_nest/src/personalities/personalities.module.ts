import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonalitiesController } from './personalities.controller';
import { PersonalitiesService } from './personalities.service';
import { Personality } from './personality.entity';

import { CommentsModule } from 'src/comments/comments.module';
import { FavoritesModule } from 'src/favorites/favorites.module';
import { RatingsModule } from 'src/ratings/ratings.module';

import { Comment } from 'src/comments/comment.entity';
import { Favorite } from 'src/favorites/favorite.entity';
import { Rating } from 'src/ratings/rating.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Personality, Comment, Rating, Favorite]),

    CommentsModule,
    RatingsModule,

    forwardRef(() => FavoritesModule),
  ],
  controllers: [PersonalitiesController],
  providers: [PersonalitiesService],
  exports: [PersonalitiesService],
})
export class PersonalitiesModule {}
