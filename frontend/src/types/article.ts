// ========================
// Базовые типы
// ========================

// Тип упражнения — строго 5 вариантов
export type ExerciseType =
  | "multiple_choice"
  | "fill_in_the_blanks"
  | "open_question"
  | "flashcards"
  | "matching_pairs";

// ========================
// Задания (items) — по типу упражнения
// ========================

// 1. Fill in the Blanks
export interface FillInTheBlanksItem {
  id: number;
  position: number;
  partBefore: string;
  partAfter: string;
  correctAnswer: string;
  distractors: string[];
  options: string[];
  wordRu: string;
  wordAr: string;
}

// 2. Multiple Choice
export interface MultipleChoiceItem {
  id: number;
  position: number;
  questionRu: string | null;
  questionAr: string | null;
  correctAnswer: string;
  options: string[];
}

// 3. Open Question
export interface OpenQuestionItem {
  id: number;
  position: number;
  questionRu: string | null;
  questionAr: string | null;
  correctAnswer: string;
  // options не нужны
}

// 4. Flashcards (карточки на перевод)
export interface FlashcardItem {
  id: number;
  position: number;
  wordAr: string;
  wordRu: string;
  correctAnswer: string; // можно не использовать, но для единообразия оставим
}

// 5. Matching Pairs (найти пару)
export interface MatchingPairItem {
  id: number;
  position: number;
  wordAr: string;
  wordRu: string;
  correctAnswer: string; // обычно совпадает с wordRu или wordAr
}

// ========================
// Упражнения — по типу
// ========================

export interface BaseExercise {
  id: number;
  type: ExerciseType;
  instructionRu: string;
  instructionAr: string;
  // audioCorrectUrl и audioIncorrectUrl НЕ НУЖНЫ — звуки на фронтенде
}

// 1. Fill in the Blanks
export interface FillInTheBlanksExercise extends BaseExercise {
  type: "fill_in_the_blanks";
  items: FillInTheBlanksItem[];
}

// 2. Multiple Choice
export interface MultipleChoiceExercise extends BaseExercise {
  type: "multiple_choice";
  items: MultipleChoiceItem[];
}

// 3. Open Question
export interface OpenQuestionExercise extends BaseExercise {
  type: "open_question";
  items: OpenQuestionItem[];
}

// 4. Flashcards
export interface FlashcardsExercise extends BaseExercise {
  type: "flashcards";
  items: FlashcardItem[];
}

// 5. Matching Pairs
export interface MatchingPairsExercise extends BaseExercise {
  type: "matching_pairs";
  items: MatchingPairItem[];
}

// ========================
// Объединяющий тип
// ========================

export type Exercise =
  | FillInTheBlanksExercise
  | MultipleChoiceExercise
  | OpenQuestionExercise
  | FlashcardsExercise
  | MatchingPairsExercise;

// ========================
// Статья
// ========================

export interface Article {
  id: number;
  titleRu: string;
  titleAr: string;
  description: string;
  content: string;
  imageUrl: string;
  videoUrl: string | null;
  themeRu: string | null;
  themeAr: string | null;
  themeSlug: string | null;
  createdAt: string;
  exercises?: Exercise[];
  averageRating?: number | null; 
  userRating?: number | null;
}

// Type guards
// ========================

export function isFillInTheBlanksExercise(
  exercise: Exercise
): exercise is FillInTheBlanksExercise {
  return exercise.type === "fill_in_the_blanks";
}
