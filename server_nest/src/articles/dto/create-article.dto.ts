import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
  ArrayUnique,
  MinLength,
  MaxLength,
} from 'class-validator';

/**
 * DTO для создания статьи
 */
export class CreateArticleDto {
  @ApiProperty({
    description: 'Название статьи',
    example: 'История и эволюция египетского диалекта',
    type: String,
    minLength: 1,
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(255)
  title!: string;

  @ApiProperty({
    description: 'Полный текст статьи в формате Markdown/HTML',
    example: '# История египетского диалекта\n\nЕгипетский диалект арабского языка (اللهجة المصرية) развивался на протяжении многих веков под влиянием различных культур и языков. Он является одним из наиболее широко понимаемых диалектов арабского языка благодаря популярности египетского кино и музыки.\n\n## Основные характеристики\n\n- Упрощенная грамматика по сравнению с фусхой\n- Уникальная фонетика\n- Заимствования из коптского, турецкого, французского и английского языков',
    type: String,
    minLength: 1,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  content!: string;

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
