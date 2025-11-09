import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from './book.entity';
import { Author } from '../authors/authors.entity';
import { Tag } from '../tags/tags.entity';
import { BookService } from './books.service';
import { BooksController } from './books.controller';
import { Favorite } from 'src/favorites/favorite.entity';
import { FavoritesModule } from 'src/favorites/favorites.module';
import { Comment } from 'src/comments/comment.entity';
import { Rating } from 'src/ratings/rating.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Book, Author, Tag, Favorite, Comment, Rating]),
    forwardRef(() => FavoritesModule),
  ],
  controllers: [BooksController],
  providers: [BookService],
  exports: [BookService],
})
export class BookModule {}
