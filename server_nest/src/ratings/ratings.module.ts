import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rating } from './rating.entity';
import { RatingsService } from './ratings.service';
import { RatingsController } from './ratings.controller';
import { User } from 'src/user/user.entity';
import { Book } from 'src/books/book.entity';
import { Textbook } from 'src/textbooks/textbook.entity';
import { Article } from 'src/articles/article.entity';
import { Media } from 'src/media/media.entity';
import { Personality } from 'src/personalities/personality.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Rating,
      User,
      Book,
      Textbook,
      Article,
      Media,
      Personality,
    ]),
  ],
  providers: [RatingsService],
  controllers: [RatingsController],
  exports: [RatingsService],
})
export class RatingsModule {}
