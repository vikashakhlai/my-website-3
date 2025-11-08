import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ExerciseType } from '../entities/exercise-type.enum';

/**
 * DTO для отдельного пункта упражнения (ExerciseItem)
 *
 * @example
 * {
 *   "position": 0,
 *   "questionRu": "Выберите правильный ответ",
 *   "questionAr": "اختر الإجابة الصحيحة",
 *   "partBefore": "Я хочу ",
 *   "partAfter": " в магазин",
 *   "distractors": ["идти", "ехать"],
 *   "wordAr": "المدرسة",
 *   "wordRu": "школа",
 *   "correctAnswer": "пойти"
 * }
 */
export class CreateExerciseItemDto {
  @ApiPropertyOptional({
    description: 'Позиция элемента в упражнении (для упорядочивания)',
    example: 0,
    type: Number,
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  position?: number;

  @ApiPropertyOptional({
    description: 'Вопрос на русском языке',
    example: 'Выберите правильный ответ',
    type: String,
  })
  @IsOptional()
  @IsString()
  questionRu?: string;

  @ApiPropertyOptional({
    description: 'Вопрос на арабском языке',
    example: 'اختر الإجابة الصحيحة',
    type: String,
  })
  @IsOptional()
  @IsString()
  questionAr?: string;

  @ApiPropertyOptional({
    description:
      'Текст перед пропуском (для упражнений типа "fill_in_the_blanks")',
    example: 'Я хочу ',
    type: String,
  })
  @IsOptional()
  @IsString()
  partBefore?: string;

  @ApiPropertyOptional({
    description:
      'Текст после пропуска (для упражнений типа "fill_in_the_blanks")',
    example: ' в магазин',
    type: String,
  })
  @IsOptional()
  @IsString()
  partAfter?: string;

  @ApiPropertyOptional({
    description: 'Массив неправильных вариантов ответа (дистракторы)',
    example: ['идти', 'ехать', 'лететь'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  distractors?: string[];

  @ApiPropertyOptional({
    description:
      'Слово на арабском языке (для упражнений типа "flashcards" и "matching_pairs")',
    example: 'المدرسة',
    type: String,
  })
  @IsOptional()
  @IsString()
  wordAr?: string;

  @ApiPropertyOptional({
    description:
      'Слово на русском языке (для упражнений типа "flashcards" и "matching_pairs")',
    example: 'школа',
    type: String,
  })
  @IsOptional()
  @IsString()
  wordRu?: string;

  @ApiPropertyOptional({
    description: 'Правильный ответ на вопрос',
    example: 'пойти',
    type: String,
  })
  @IsOptional()
  @IsString()
  correctAnswer?: string;
}

/**
 * DTO для создания упражнения (Exercise)
 *
 * Упражнение может быть связано либо со статьей (articleId),
 * либо с медиа-контентом (mediaId), но не с обоими одновременно.
 *
 * @example
 * {
 *   "type": "fill_in_the_blanks",
 *   "instructionRu": "Заполните пропуски правильными словами",
 *   "instructionAr": "املأ الفراغات بالكلمات الصحيحة",
 *   "articleId": 5,
 *   "distractorPoolId": null,
 *   "items": [
 *     {
 *       "position": 0,
 *       "partBefore": "Я хочу ",
 *       "partAfter": " в магазин",
 *       "correctAnswer": "пойти",
 *       "distractors": ["идти", "ехать"]
 *     }
 *   ]
 * }
 */
export class CreateExerciseDto {
  @ApiPropertyOptional({
    description: 'Тип упражнения',
    enum: ExerciseType,
    example: ExerciseType.FILL_IN_THE_BLANKS,
  })
  @IsOptional()
  @IsEnum(ExerciseType)
  type?: ExerciseType;

  @ApiPropertyOptional({
    description: 'Инструкция к упражнению на русском языке',
    example: 'Заполните пропуски правильными словами',
    type: String,
  })
  @IsOptional()
  @IsString()
  instructionRu?: string;

  @ApiPropertyOptional({
    description: 'Инструкция к упражнению на арабском языке',
    example: 'املأ الفراغات بالكلمات الصحيحة',
    type: String,
  })
  @IsOptional()
  @IsString()
  instructionAr?: string;

  @ApiPropertyOptional({
    description:
      'Идентификатор статьи, к которой привязано упражнение (если упражнение текстовое). При создании через POST /articles/{id}/exercises это поле устанавливается автоматически.',
    example: 5,
    type: Number,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  articleId?: number;

  @ApiPropertyOptional({
    description:
      'Идентификатор медиа-контента, к которому привязано упражнение (если упражнение видео или диалоговое). При создании через POST /media/{id}/exercises это поле устанавливается автоматически.',
    example: null,
    type: Number,
    minimum: 1,
    nullable: true,
  })
  @IsOptional()
  @IsInt()
  mediaId?: number;

  @ApiPropertyOptional({
    description:
      'Идентификатор пула дистракторов (для упражнений типа "multiple_choice" и "matching_pairs")',
    example: null,
    type: Number,
    nullable: true,
  })
  @IsOptional()
  @IsInt()
  distractorPoolId?: number;

  @ApiPropertyOptional({
    description: 'Список элементов упражнения, отсортированных по позиции',
    type: [CreateExerciseItemDto],
    example: [
      {
        position: 0,
        partBefore: 'Я хочу ',
        partAfter: ' в магазин',
        correctAnswer: 'пойти',
        distractors: ['идти', 'ехать'],
      },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateExerciseItemDto)
  items?: CreateExerciseItemDto[];
}
