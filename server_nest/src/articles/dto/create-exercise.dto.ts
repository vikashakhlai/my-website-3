import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ExerciseType } from '../entities/exercise-type.enum';

/**
 * DTO для отдельного пункта упражнения (ExerciseItem)
 */
export class CreateExerciseItemDto {
  @IsOptional()
  @IsInt()
  position?: number;

  @IsOptional()
  @IsString()
  questionRu?: string;

  @IsOptional()
  @IsString()
  questionAr?: string;

  @IsOptional()
  @IsString()
  partBefore?: string;

  @IsOptional()
  @IsString()
  partAfter?: string;

  @IsOptional()
  @IsArray()
  distractors?: string[];

  @IsOptional()
  @IsString()
  wordAr?: string;

  @IsOptional()
  @IsString()
  wordRu?: string;

  @IsOptional()
  @IsString()
  correctAnswer?: string;
}

/**
 * DTO для создания упражнения (Exercise)
 */
export class CreateExerciseDto {
  /** Тип упражнения */
  @IsOptional()
  @IsEnum(ExerciseType)
  type?: ExerciseType;

  /** Инструкция */
  @IsOptional()
  @IsString()
  instructionRu?: string;

  @IsOptional()
  @IsString()
  instructionAr?: string;

  /** Ссылка на статью (если упражнение текстовое) */
  @IsOptional()
  @IsInt()
  articleId?: number;

  /** Ссылка на медиа (если упражнение видео или диалоговое) */
  @IsOptional()
  @IsInt()
  mediaId?: number;

  /** Ссылка на пул дистракторов */
  @IsOptional()
  @IsInt()
  distractorPoolId?: number;

  /** Список элементов упражнения */
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateExerciseItemDto)
  items?: CreateExerciseItemDto[];
}
