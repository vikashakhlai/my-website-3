import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ExerciseType } from '../entities/exercise-type.enum';

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

export class CreateExerciseDto {
  @IsOptional()
  @IsEnum(ExerciseType)
  type?: ExerciseType;

  @IsOptional()
  @IsString()
  instructionRu?: string;

  @IsOptional()
  @IsString()
  instructionAr?: string;

  @IsOptional()
  @IsInt()
  articleId?: number;

  @IsOptional()
  @IsInt()
  mediaId?: number;

  @IsOptional()
  @IsInt()
  distractorPoolId?: number;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateExerciseItemDto)
  items?: CreateExerciseItemDto[];
}
