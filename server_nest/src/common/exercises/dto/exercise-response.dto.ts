import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { ExerciseType } from 'src/articles/entities/exercise-type.enum';
import { ExerciseItemResponseDto } from './exercise-item-response.dto';

/**
 * DTO для представления упражнения в ответе API
 *
 * Упражнение может быть связано со статьей или медиа-контентом.
 * Структура элементов упражнения зависит от типа упражнения.
 *
 * @example
 * {
 *   "id": 1,
 *   "type": "fill_in_the_blanks",
 *   "instructionRu": "Заполните пропуски правильными словами",
 *   "instructionAr": "املأ الفراغات بالكلمات الصحيحة",
 *   "articleId": 5,
 *   "mediaId": null,
 *   "distractorPoolId": null,
 *   "items": [
 *     {
 *       "id": 1,
 *       "position": 0,
 *       "partBefore": "Я хочу ",
 *       "partAfter": " в магазин",
 *       "correctAnswer": "пойти",
 *       "options": ["пойти", "идти", "ехать"]
 *     }
 *   ]
 * }
 */
export class ExerciseResponseDto {
  @ApiProperty({
    description: 'Уникальный идентификатор упражнения',
    example: 1,
    type: Number,
  })
  @Expose()
  id!: number;

  @ApiProperty({
    description: 'Тип упражнения',
    enum: ExerciseType,
    example: ExerciseType.FILL_IN_THE_BLANKS,
  })
  @Expose()
  type!: ExerciseType;

  @ApiPropertyOptional({
    description: 'Инструкция к упражнению на русском языке',
    example: 'Заполните пропуски правильными словами',
    type: String,
    nullable: true,
  })
  @Expose()
  instructionRu?: string | null;

  @ApiPropertyOptional({
    description: 'Инструкция к упражнению на арабском языке',
    example: 'املأ الفراغات بالكلمات الصحيحة',
    type: String,
    nullable: true,
  })
  @Expose()
  instructionAr?: string | null;

  @ApiPropertyOptional({
    description:
      'Идентификатор статьи, к которой привязано упражнение (если упражнение текстовое)',
    example: 5,
    type: Number,
    nullable: true,
  })
  @Expose()
  articleId?: number | null;

  @ApiPropertyOptional({
    description:
      'Идентификатор медиа-контента, к которому привязано упражнение (если упражнение видео или диалоговое)',
    example: null,
    type: Number,
    nullable: true,
  })
  @Expose()
  mediaId?: number | null;

  @ApiPropertyOptional({
    description:
      'Идентификатор пула дистракторов (для упражнений типа "multiple_choice" и "matching_pairs")',
    example: null,
    type: Number,
    nullable: true,
  })
  @Expose()
  distractorPoolId?: number | null;

  @ApiProperty({
    description: 'Список элементов упражнения, отсортированных по позиции',
    type: [ExerciseItemResponseDto],
  })
  @Expose()
  @Type(() => ExerciseItemResponseDto)
  items!: ExerciseItemResponseDto[];
}
