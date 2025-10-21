import { Article } from '../article.entity';
import { Exercise } from '../entities/exercise.entity';
import { ExerciseItem } from '../entities/exercise-item.entity';

export interface ExerciseItemWithOptions extends ExerciseItem {
  options?: string[];
}

export interface ExerciseWithItems extends Exercise {
  items: ExerciseItemWithOptions[];
}

export interface ArticleWithExercises extends Article {
  exercises: ExerciseWithItems[];
}
