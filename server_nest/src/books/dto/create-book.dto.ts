// src/books/dto/create-book.dto.ts
import { Type } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsInt,
  IsArray,
  ArrayNotEmpty,
  ArrayUnique,
  IsNotEmpty,
} from 'class-validator';

export class CreateBookDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  publication_year?: number;

  @IsOptional()
  @IsString()
  cover_url?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  pages?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  publisher_id?: number;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @Type(() => Number)
  @IsInt({ each: true })
  authorIds?: number[];

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @Type(() => Number)
  @IsInt({ each: true })
  tagIds?: number[];
}
