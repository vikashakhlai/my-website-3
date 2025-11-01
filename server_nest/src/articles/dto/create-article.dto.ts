import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
  ArrayUnique,
} from 'class-validator';

export class CreateArticleDto {
  @ApiProperty({ example: 'История и эволюция диалекта X' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: 'Полный текст статьи в формате Markdown/HTML' })
  @IsString()
  @IsNotEmpty()
  content!: string;

  @ApiPropertyOptional({ example: 'linguistics' })
  @IsOptional()
  @IsString()
  theme?: string;

  @ApiPropertyOptional({ example: ['dialect', 'history'] })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  tags?: string[];
}
