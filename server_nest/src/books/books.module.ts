import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from './book.entity';
import { Author } from '../authors/authors.entity';
import { Tag } from '../tags/tags.entity';
import { BookComment } from './book-comment.entity';
import { BookRating } from './book-rating.entity';
import { BookService } from './books.service';
import { BooksController } from './books.controller';
import { BookCommentsController } from './book-comments.controller';
import { BookCommentsService } from './book-comments.service';
import { AuthModule } from 'src/auth/auth.module';
import { Favorite } from 'src/favorites/favorite.entity';
import { FavoritesModule } from 'src/favorites/favorites.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Book,
      Author,
      Tag,
      BookComment,
      BookRating,
      Favorite,
    ]),
    AuthModule,
    FavoritesModule,
  ],
  controllers: [BooksController, BookCommentsController],
  providers: [BookService, BookCommentsService],
  exports: [BookService],
})
export class BookModule {}
