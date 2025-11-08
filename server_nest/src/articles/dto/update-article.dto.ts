import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateArticleDto } from './create-article.dto';
import {
  IsOptional,
  IsString,
  IsArray,
  ArrayUnique,
  MinLength,
  MaxLength,
} from 'class-validator';

/**
 * DTO для обновления статьи
 * Все поля опциональны
 */
export class UpdateArticleDto extends PartialType(CreateArticleDto) {
  @ApiPropertyOptional({
    description: 'Название статьи',
    example: 'История и эволюция египетского диалекта',
    type: String,
    minLength: 1,
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional({
    description: 'Полный текст статьи в формате Markdown/HTML',
    example: '# История диалекта\n\nДиалект развивался на протяжении...',
    type: String,
    minLength: 1,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  content?: string;

  @ApiPropertyOptional({
    description: 'Slug темы статьи',
    example: 'linguistics',
    type: String,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  theme?: string;

  @ApiPropertyOptional({
    description: 'Список тегов статьи',
    example: ['dialect', 'history', 'egypt'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  tags?: string[];
}
