import type { Exercise } from '../types/article';
import type {
  FillInTheBlanksExercise,
  MultipleChoiceExercise,
  OpenQuestionExercise,
  FlashcardsExercise,
  MatchingPairsExercise,
} from '../types/article';

export function isFillInTheBlanksExercise(
  exercise: Exercise
): exercise is FillInTheBlanksExercise {
  return exercise.type === 'fill_in_the_blanks';
}

export function isMultipleChoiceExercise(
  exercise: Exercise
): exercise is MultipleChoiceExercise {
  return exercise.type === 'multiple_choice';
}

export function isOpenQuestionExercise(
  exercise: Exercise
): exercise is OpenQuestionExercise {
  return exercise.type === 'open_question';
}

export function isFlashcardsExercise(
  exercise: Exercise
): exercise is FlashcardsExercise {
  return exercise.type === 'flashcards';
}

export function isMatchingPairsExercise(
  exercise: Exercise
): exercise is MatchingPairsExercise {
  return exercise.type === 'matching_pairs';
}

