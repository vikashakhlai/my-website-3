import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

/**
 * DTO для представления элемента упражнения в ответе API
 * 
 * Элемент упражнения представляет собой отдельный вопрос или задание
 * в рамках упражнения. Структура зависит от типа упражнения.
 * 
 * @example
 * {
 *   "id": 1,
 *   "position": 0,
 *   "questionRu": "Выберите правильный ответ",
 *   "questionAr": "اختر الإجابة الصحيحة",
 *   "partBefore": "Я хочу ",
 *   "partAfter": " в магазин",
 *   "distractors": ["идти", "ехать", "лететь"],
 *   "wordAr": "المدرسة",
 *   "wordRu": "школа",
 *   "correctAnswer": "пойти",
 *   "options": ["пойти", "идти", "ехать", "лететь"]
 * }
 */
export class ExerciseItemResponseDto {
  @ApiProperty({
    description: 'Уникальный идентификатор элемента упражнения',
    example: 1,
    type: Number,
  })
  @Expose()
  id!: number;

  @ApiPropertyOptional({
    description: 'Позиция элемента в упражнении (для упорядочивания)',
    example: 0,
    type: Number,
  })
  @Expose()
  position?: number;

  @ApiPropertyOptional({
    description: 'Вопрос на русском языке',
    example: 'Выберите правильный ответ',
    type: String,
    nullable: true,
  })
  @Expose()
  questionRu?: string | null;

  @ApiPropertyOptional({
    description: 'Вопрос на арабском языке',
    example: 'اختر الإجابة الصحيحة',
    type: String,
    nullable: true,
  })
  @Expose()
  questionAr?: string | null;

  @ApiPropertyOptional({
    description: 'Текст перед пропуском (для упражнений типа "fill_in_the_blanks")',
    example: 'Я хочу ',
    type: String,
    nullable: true,
  })
  @Expose()
  partBefore?: string | null;

  @ApiPropertyOptional({
    description: 'Текст после пропуска (для упражнений типа "fill_in_the_blanks")',
    example: ' в магазин',
    type: String,
    nullable: true,
  })
  @Expose()
  partAfter?: string | null;

  @ApiPropertyOptional({
    description: 'Массив неправильных вариантов ответа (дистракторы)',
    example: ['идти', 'ехать', 'лететь'],
    type: [String],
    nullable: true,
  })
  @Expose()
  distractors?: string[] | null;

  @ApiPropertyOptional({
    description: 'Слово на арабском языке (для упражнений типа "flashcards" и "matching_pairs")',
    example: 'المدرسة',
    type: String,
    nullable: true,
  })
  @Expose()
  wordAr?: string | null;

  @ApiPropertyOptional({
    description: 'Слово на русском языке (для упражнений типа "flashcards" и "matching_pairs")',
    example: 'школа',
    type: String,
    nullable: true,
  })
  @Expose()
  wordRu?: string | null;

  @ApiPropertyOptional({
    description: 'Правильный ответ на вопрос',
    example: 'пойти',
    type: String,
    nullable: true,
  })
  @Expose()
  correctAnswer?: string | null;

  @ApiPropertyOptional({
    description: 'Все доступные варианты ответа (включая правильный и дистракторы). Вычисляемое поле, добавляется сервером для удобства клиента',
    example: ['пойти', 'идти', 'ехать', 'лететь'],
    type: [String],
    nullable: true,
  })
  @Expose()
  options?: string[] | null;
}

