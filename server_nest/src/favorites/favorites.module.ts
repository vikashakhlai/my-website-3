import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Favorite } from './favorite.entity';
import { FavoritesService } from './favorites.service';
import { FavoritesController } from './favorites.controller';

// Импортируем сущности контента
import { Book } from '../books/book.entity';
import { Textbook } from '../textbooks/textbook.entity';
import { Article } from '../articles/article.entity';
import { Media } from '../media/media.entity';
import { Personality } from '../personalities/personality.entity';

// Модули, чтобы TypeORM корректно разрешил связи
import { BookModule } from '../books/books.module';
import { TextbooksModule } from '../textbooks/textbooks.module';
import { ArticlesModule } from '../articles/articles.module';
import { MediaModule } from '../media/media.module';
import { PersonalitiesModule } from 'src/personalities/personalities.module';

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

    // forwardRef предотвращает циклические зависимости
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
