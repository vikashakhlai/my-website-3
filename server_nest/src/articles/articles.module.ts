import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from './article.entity';
import { Theme } from 'src/articles/themes/theme.entity';
import { Exercise } from './entities/exercise.entity';
import { ExerciseItem } from './entities/exercise-item.entity';
import { Distractor } from './entities/distractor.entity';
import { ArticlesService } from './articles.service';
import { ArticlesController } from './articles.controller';
import { Rating } from 'src/ratings/rating.entity';
import { Comment } from 'src/comments/comment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Article,
      Theme,
      Exercise,
      ExerciseItem,
      Distractor,
      Rating,
      Comment,
    ]),
  ],
  controllers: [ArticlesController],
  providers: [ArticlesService],
  exports: [ArticlesService],
})
export class ArticlesModule {}
