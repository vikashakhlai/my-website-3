// src/textbooks/dto/create-textbook.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsNumber,
  IsUrl,
  IsNotEmpty,
  MinLength,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO для создания учебника
 */
export class CreateTextbookDto {
  @ApiProperty({
    description: 'Название учебника',
    example: 'Учебник арабского языка для начинающих',
    type: String,
    minLength: 1,
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(255)
  title!: string;

  @ApiPropertyOptional({
    description: 'Авторы учебника (может быть строка с несколькими авторами)',
    example: 'Ахмед Хасан, Мария Иванова',
    type: String,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  authors?: string;

  @ApiPropertyOptional({
    description: 'Описание учебника',
    example: 'Комплексный учебник для изучения арабского языка с нуля. Включает грамматику, лексику, упражнения и аудиоматериалы для развития навыков чтения, письма и говорения.',
    type: String,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Уровень сложности учебника',
    example: 'beginner',
    type: String,
    maxLength: 50,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  level?: string;

  @ApiPropertyOptional({
    description: 'Год публикации учебника',
    example: 2020,
    type: Number,
    minimum: 1000,
    maximum: 9999,
    nullable: true,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1000)
  @Max(9999)
  publication_year?: number;

  @ApiPropertyOptional({
    description: 'URL PDF файла учебника',
    example: 'https://example.com/textbook.pdf',
    type: String,
    nullable: true,
  })
  @IsOptional()
  @IsUrl()
  pdf_url?: string;

  @ApiPropertyOptional({
    description: 'URL обложки учебника',
    example: 'https://example.com/textbook-cover.jpg',
    type: String,
    nullable: true,
  })
  @IsOptional()
  @IsUrl()
  cover_image_url?: string;
}
