import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  ArrayUnique,
  MaxLength,
  MinLength,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { MediaType } from './media-type.enum';
import { MediaLevel } from './media-level.enum';

/**
 * DTO для обновления медиа-контента
 * Все поля опциональны
 */
export class UpdateMediaRequestDto {
  @ApiPropertyOptional({
    description: 'Название медиа-контента',
    example: 'Traditional Wedding Song',
    type: String,
    maxLength: 300,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(300)
  title?: string;

  @ApiPropertyOptional({
    description: 'URL основного медиа-файла (видео или аудио)',
    example: '/uploads/media/updated.mp4',
    type: String,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  mediaUrl?: string | null;

  @ApiPropertyOptional({
    description: 'URL превью-изображения (миниатюра)',
    example: '/uploads/media/thumbnails/updated.jpg',
    type: String,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  previewUrl?: string | null;

  @ApiPropertyOptional({
    description: 'URL файла субтитров в формате VTT',
    example: '/uploads/subtitles/updated.vtt',
    type: String,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  subtitlesLink?: string | null;

  @ApiPropertyOptional({
    description: 'Тип медиа-контента',
    enum: MediaType,
    example: MediaType.VIDEO,
  })
  @IsOptional()
  @IsEnum(MediaType)
  type?: MediaType;

  @ApiPropertyOptional({
    description: 'ID диалекта, связанного с медиа',
    example: 12,
    type: Number,
    minimum: 1,
    nullable: true,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  dialectId?: number | null;

  @ApiPropertyOptional({
    description: 'Тип лицензии',
    example: 'public',
    type: String,
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  licenseType?: string;

  @ApiPropertyOptional({
    description: 'Автор/источник лицензии',
    example: 'Studio Oasis',
    type: String,
    maxLength: 200,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  licenseAuthor?: string | null;

  @ApiPropertyOptional({
    description: 'Уровень сложности медиа-контента',
    enum: MediaLevel,
    example: MediaLevel.BEGINNER,
  })
  @IsOptional()
  @IsEnum(MediaLevel)
  level?: MediaLevel;

  @ApiPropertyOptional({
    description: 'ID группы диалогов, к которой относится медиа',
    example: 5,
    type: Number,
    minimum: 1,
    nullable: true,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  dialogueGroupId?: number | null;

  @ApiPropertyOptional({
    description: 'Длительность медиа-контента в формате MM:SS или HH:MM:SS',
    example: '00:03:24',
    type: String,
    maxLength: 20,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  duration?: string | null;

  @ApiPropertyOptional({
    description: 'Имя говорящего в медиа',
    example: 'Mahmoud',
    type: String,
    maxLength: 200,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  speaker?: string | null;

  @ApiPropertyOptional({
    description: 'Роль источника (для подписи "предоставлено", "создано")',
    example: 'partner',
    type: String,
    maxLength: 100,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  sourceRole?: string | null;

  @ApiPropertyOptional({
    description: 'URL файла с грамматическими материалами (обычно PDF)',
    example: 'https://example.com/grammar.pdf',
    type: String,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  grammarLink?: string | null;

  @ApiPropertyOptional({
    description: 'Дополнительные ресурсы (PDF, глоссарии и т.д.) в формате объекта',
    type: 'object',
    additionalProperties: true,
    example: { pdf: '/uploads/media/extra.pdf', glossary: '/glossary.json' },
    nullable: true,
  })
  @IsOptional()
  resources?: Record<string, any> | null;

  @ApiPropertyOptional({
    description: 'Список ID тем диалекта, связанных с медиа',
    type: [Number],
    example: [2, 7, 9],
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @Type(() => Number)
  @IsInt({ each: true })
  topicIds?: number[];
}
