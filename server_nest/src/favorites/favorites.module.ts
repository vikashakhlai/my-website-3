import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Favorite } from './favorite.entity';
import { FavoritesController } from './favorites.controller';
import { FavoritesService } from './favorites.service';

import { Article } from '../articles/article.entity';
import { Book } from '../books/book.entity';
import { Media } from '../media/media.entity';
import { Personality } from '../personalities/personality.entity';
import { Textbook } from '../textbooks/textbook.entity';

import { PersonalitiesModule } from 'src/personalities/personalities.module';
import { ArticlesModule } from '../articles/articles.module';
import { BookModule } from '../books/books.module';
import { MediaModule } from '../media/media.module';
import { TextbooksModule } from '../textbooks/textbooks.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Favorite,
      Book,
      Textbook,
      Article,
      Media,
      Personality,
    ]),

    forwardRef(() => BookModule),
    forwardRef(() => TextbooksModule),
    forwardRef(() => ArticlesModule),
    forwardRef(() => MediaModule),
    forwardRef(() => PersonalitiesModule),
  ],
  controllers: [FavoritesController],
  providers: [FavoritesService],
  exports: [FavoritesService],
})
export class FavoritesModule {}
