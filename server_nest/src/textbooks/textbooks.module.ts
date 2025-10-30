import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Textbook } from './textbook.entity';
import { TextbooksService } from './textbooks.service';
import { TextbooksController } from './textbooks.controller';
import { Rating } from 'src/ratings/rating.entity';
import { Comment } from 'src/comments/comment.entity';
import { RatingsModule } from 'src/ratings/ratings.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Textbook, Rating, Comment]),
    RatingsModule,
  ],
  controllers: [TextbooksController],
  providers: [TextbooksService],
  exports: [TextbooksService],
})
export class TextbooksModule {}
