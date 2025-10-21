import {
  IsString,
  IsOptional,
  IsInt,
  IsArray,
  ArrayNotEmpty,
  ArrayUnique,
} from 'class-validator';

export class CreateBookDto {
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  publication_year?: number;

  @IsOptional()
  @IsString()
  cover_url?: string;

  @IsOptional()
  @IsInt()
  pages?: number;

  @IsOptional()
  @IsInt()
  publisher_id?: number;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  authorIds?: number[];

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  tagIds?: number[];
}
