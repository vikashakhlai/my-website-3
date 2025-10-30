// src/textbooks/dto/create-textbook.dto.ts
import { IsOptional, IsString, IsNumber, IsUrl } from 'class-validator';

export class CreateTextbookDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  authors?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  level?: string;

  @IsOptional()
  @IsNumber()
  publication_year?: number;

  @IsOptional()
  @IsUrl()
  pdf_url?: string;

  @IsOptional()
  @IsUrl()
  cover_image_url?: string;
}
