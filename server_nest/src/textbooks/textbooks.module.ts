import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from 'src/comments/comment.entity';
import { CommentsModule } from 'src/comments/comments.module';
import { Favorite } from 'src/favorites/favorite.entity';
import { FavoritesModule } from 'src/favorites/favorites.module';
import { Rating } from 'src/ratings/rating.entity';
import { RatingsModule } from 'src/ratings/ratings.module';
import { Textbook } from './textbook.entity';
import { TextbooksController } from './textbooks.controller';
import { TextbooksService } from './textbooks.service';

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
