import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { Comment } from 'src/comments/comment.entity';
import { Favorite } from 'src/favorites/favorite.entity';
import { FavoritesModule } from 'src/favorites/favorites.module';
import { Rating } from 'src/ratings/rating.entity';
import { Author } from '../authors/authors.entity';
import { Tag } from '../tags/tags.entity';
import { Book } from './book.entity';
import { BooksController } from './books.controller';
import { BookService } from './books.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Book, Author, Tag, Favorite, Comment, Rating]),
    AuthModule,
    forwardRef(() => FavoritesModule),
  ],
  controllers: [BooksController],
  providers: [BookService],
  exports: [BookService],
})
export class BookModule {}
