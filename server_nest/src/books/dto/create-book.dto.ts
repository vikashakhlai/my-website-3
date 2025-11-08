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
  MinLength,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO для создания книги
 */
export class CreateBookDto {
  @ApiProperty({
    description: 'Название книги',
    example: 'ديوان أحمد شوقي',
    type: String,
    minLength: 1,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  title!: string;

  @ApiPropertyOptional({
    description: 'Описание книги',
    example: 'Сборник стихов выдающегося арабского поэта Ахмеда Шауки',
    type: String,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Год публикации книги',
    example: 1927,
    type: Number,
    minimum: 1000,
    maximum: 9999,
    nullable: true,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1000)
  @Max(9999)
  publication_year?: number;

  @ApiPropertyOptional({
    description: 'URL обложки книги',
    example: '/uploads/books/diwan-ahmed-shawki.jpg',
    type: String,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  cover_url?: string;

  @ApiPropertyOptional({
    description: 'Количество страниц в книге',
    example: 450,
    type: Number,
    minimum: 1,
    nullable: true,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pages?: number;

  @ApiPropertyOptional({
    description: 'ID издательства',
    example: 3,
    type: Number,
    nullable: true,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  publisher_id?: number;

  @ApiPropertyOptional({
    description: 'Список ID авторов книги',
    type: [Number],
    example: [1, 2],
    minItems: 1,
  })
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @Type(() => Number)
  @IsInt({ each: true })
  authorIds?: number[];

  @ApiPropertyOptional({
    description: 'Список ID тегов, связанных с книгой',
    type: [Number],
    example: [5, 8],
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @Type(() => Number)
  @IsInt({ each: true })
  tagIds?: number[];
}
