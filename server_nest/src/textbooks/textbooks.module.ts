import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Textbook } from './textbook.entity';
import { TextbooksService } from './textbooks.service';
import { TextbooksController } from './textbooks.controller';
import { Rating } from 'src/ratings/rating.entity';
import { Comment } from 'src/comments/comment.entity';
import { RatingsModule } from 'src/ratings/ratings.module';
import { Favorite } from 'src/favorites/favorite.entity';
import { CommentsModule } from 'src/comments/comments.module';
import { FavoritesModule } from 'src/favorites/favorites.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Textbook, Rating, Comment, Favorite]),
    RatingsModule,
    CommentsModule,
    forwardRef(() => FavoritesModule),
  ],
  controllers: [TextbooksController],
  providers: [TextbooksService],
  exports: [TextbooksService],
})
export class TextbooksModule {}
