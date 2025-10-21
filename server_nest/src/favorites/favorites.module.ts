// src/favorites/favorites.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Favorite } from './favorite.entity';
import { FavoritesService } from './favorites.service';
import { FavoritesController } from './favorites.controller';

// Импортируем типы контента, которые можно добавлять в избранное
import { Book } from '../books/book.entity';
import { Textbook } from '../textbooks/textbook.entity';
import { Article } from '../articles/article.entity';
import { Video } from '../videos/video.entity';

// Модули, чтобы TypeORM мог корректно разрешить связи при использовании сервисов
import { BookModule } from '../books/books.module';
import { TextbooksModule } from '../textbooks/textbooks.module';
import { ArticlesModule } from '../articles/articles.module';
import { VideosModule } from '../videos/videos.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Favorite, Book, Textbook, Article, Video]),

    // forwardRef предотвращает циклические зависимости
    forwardRef(() => BookModule),
    forwardRef(() => TextbooksModule),
    forwardRef(() => ArticlesModule),
    forwardRef(() => VideosModule),
  ],
  controllers: [FavoritesController],
  providers: [FavoritesService],
  exports: [FavoritesService],
})
export class FavoritesModule {}
