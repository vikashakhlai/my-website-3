import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  ArrayUnique,
  MinLength,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { MediaType } from './media-type.enum';
import { MediaLevel } from './media-level.enum';

/**
 * DTO для создания медиа-контента
 */
export class CreateMediaRequestDto {
  @ApiProperty({
    description: 'Название медиа-контента',
    example: 'Диалог о подготовке к свадьбе',
    type: String,
    minLength: 1,
    maxLength: 300,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(300)
  title!: string;

  @ApiPropertyOptional({
    description: 'URL основного медиа-файла (видео или аудио)',
    example: '/uploads/media/file.mp4',
    type: String,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  mediaUrl?: string;

  @ApiPropertyOptional({
    description: 'URL превью-изображения (миниатюра)',
    example: '/uploads/media/thumbnails/file.jpg',
    type: String,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  previewUrl?: string;

  @ApiPropertyOptional({
    description: 'Тип медиа-контента',
    enum: MediaType,
    example: MediaType.VIDEO,
    default: MediaType.VIDEO,
  })
  @IsOptional()
  @IsEnum(MediaType)
  type?: MediaType;

  @ApiPropertyOptional({
    description: 'URL файла субтитров в формате VTT',
    example: '/uploads/subtitles/file.vtt',
    type: String,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  subtitlesLink?: string;

  @ApiPropertyOptional({
    description: 'URL файла с грамматическими материалами (обычно PDF)',
    example: '/uploads/grammar/file.pdf',
    type: String,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  grammarLink?: string;

  @ApiPropertyOptional({
    description: 'Уровень сложности медиа-контента',
    enum: MediaLevel,
    example: MediaLevel.BEGINNER,
    default: MediaLevel.BEGINNER,
  })
  @IsOptional()
  @IsEnum(MediaLevel)
  level?: MediaLevel;

  @ApiPropertyOptional({
    description: 'Дополнительные ресурсы (PDF, глоссарии и т.д.) в формате объекта',
    type: 'object',
    additionalProperties: true,
    example: { pdf: '/file.pdf', glossary: '/glossary.json' },
    nullable: true,
  })
  @IsOptional()
  resources?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'ID диалекта, связанного с медиа',
    example: 5,
    type: Number,
    minimum: 1,
    nullable: true,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  dialectId?: number;

  @ApiPropertyOptional({
    description: 'Тип лицензии',
    example: 'public',
    type: String,
    maxLength: 50,
    default: 'public',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  licenseType?: string;

  @ApiPropertyOptional({
    description: 'Автор/источник лицензии',
    example: 'Al Jazeera',
    type: String,
    maxLength: 200,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  licenseAuthor?: string;

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
  duration?: string;

  @ApiPropertyOptional({
    description: 'Имя говорящего в медиа',
    example: 'محمد',
    type: String,
    maxLength: 200,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  speaker?: string;

  @ApiPropertyOptional({
    description: 'Роль источника (для подписи "предоставлено", "создано")',
    example: 'Эксклюзив Oasis',
    type: String,
    maxLength: 100,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  sourceRole?: string;

  @ApiPropertyOptional({
    description: 'ID группы диалогов, к которой относится медиа',
    example: 2,
    type: Number,
    minimum: 1,
    nullable: true,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  dialogueGroupId?: number;

  @ApiPropertyOptional({
    description: 'Список ID тем диалекта, связанных с медиа',
    type: [Number],
    example: [1, 3, 7],
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @Type(() => Number)
  @IsInt({ each: true })
  topicIds?: number[];
}
