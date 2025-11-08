import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { MediaLevel } from '../enums/media-level.enum';
import { MediaType } from '../enums/media-type.enum';

export class CreateMediaRequestDto {
  @ApiProperty({
    example: 'Traditional Wedding Song',
    description: 'Название медиа',
  })
  @IsString({ message: 'Название должно быть строкой' })
  @MaxLength(300, { message: 'Название не может быть длиннее 300 символов' })
  title!: string;

  @ApiPropertyOptional({
    example: '/uploads/media/file.mp4',
    nullable: true,
    description: 'Путь к медиа-файлу',
  })
  @IsOptional()
  @IsUrl(
    { require_tld: false },
    { message: 'mediaUrl должен быть корректным URL или путем' },
  )
  @MaxLength(500, { message: 'mediaUrl не может быть длиннее 500 символов' })
  mediaUrl?: string;

  @ApiPropertyOptional({
    example: '/uploads/media/thumbnails/file.jpg',
    nullable: true,
    description: 'Путь к превью',
  })
  @IsOptional()
  @IsUrl(
    { require_tld: false },
    { message: 'previewUrl должен быть корректным URL или путем' },
  )
  @MaxLength(500, { message: 'previewUrl не может быть длиннее 500 символов' })
  previewUrl?: string;

  @ApiPropertyOptional({
    enum: MediaType,
    example: MediaType.VIDEO,
    description: 'Тип медиа',
  })
  @IsOptional()
  @IsEnum(MediaType, { message: 'type должен быть допустимым значением' })
  type?: MediaType;

  @ApiPropertyOptional({
    example: '/uploads/subs/file.vtt',
    nullable: true,
    description: 'Путь к субтитрам',
  })
  @IsOptional()
  @IsUrl(
    { require_tld: false },
    { message: 'subtitlesLink должен быть корректным URL или путем' },
  )
  @MaxLength(500, {
    message: 'subtitlesLink не может быть длиннее 500 символов',
  })
  subtitlesLink?: string;

  @ApiPropertyOptional({
    example: '/uploads/grammar/file.pdf',
    nullable: true,
    description: 'Путь к грамматике',
  })
  @IsOptional()
  @IsUrl(
    { require_tld: false },
    { message: 'grammarLink должен быть корректным URL или путем' },
  )
  @MaxLength(500, { message: 'grammarLink не может быть длиннее 500 символов' })
  grammarLink?: string;

  @ApiPropertyOptional({
    enum: MediaLevel,
    example: MediaLevel.BEGINNER,
    description: 'Уровень сложности',
  })
  @IsOptional()
  @IsEnum(MediaLevel, { message: 'level должен быть допустимым значением' })
  level?: MediaLevel;

  @ApiPropertyOptional({
    type: 'object',
    additionalProperties: true,
    example: { pdf: '/file.pdf' },
    nullable: true,
    description: 'Дополнительные ресурсы',
  })
  @IsOptional()
  @ValidateNested()
  resources?: Record<string, any>;

  @ApiPropertyOptional({
    example: 5,
    description: 'ID диалекта',
    nullable: true,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'dialectId должно быть целым числом' })
  dialectId?: number;

  @ApiPropertyOptional({ example: 'public', description: 'Тип лицензии' })
  @IsOptional()
  @IsString({ message: 'licenseType должно быть строкой' })
  @MaxLength(50, { message: 'licenseType не может быть длиннее 50 символов' })
  licenseType?: string;

  @ApiPropertyOptional({
    example: 'Al Jazeera',
    nullable: true,
    description: 'Автор лицензии',
  })
  @IsOptional()
  @IsString({ message: 'licenseAuthor должно быть строкой' })
  @MaxLength(200, {
    message: 'licenseAuthor не может быть длиннее 200 символов',
  })
  licenseAuthor?: string;

  @ApiPropertyOptional({
    example: '00:03:24',
    nullable: true,
    description: 'Длительность',
  })
  @IsOptional()
  @IsString({ message: 'duration должно быть строкой' })
  @MaxLength(20, { message: 'duration не может быть длиннее 20 символов' })
  duration?: string;

  @ApiPropertyOptional({
    example: 'محمد',
    nullable: true,
    description: 'Говорящий',
  })
  @IsOptional()
  @IsString({ message: 'speaker должно быть строкой' })
  @MaxLength(200, { message: 'speaker не может быть длиннее 200 символов' })
  speaker?: string;

  @ApiPropertyOptional({
    example: 'Эксклюзив Oasis',
    nullable: true,
    description: 'Роль источника',
  })
  @IsOptional()
  @IsString({ message: 'sourceRole должно быть строкой' })
  @MaxLength(100, { message: 'sourceRole не может быть длиннее 100 символов' })
  sourceRole?: string;

  @ApiPropertyOptional({
    example: 2,
    description: 'ID группы диалогов',
    nullable: true,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'dialogueGroupId должно быть целым числом' })
  dialogueGroupId?: number;

  @ApiPropertyOptional({
    example: [1, 3, 7],
    description: 'ID топиков',
    nullable: true,
  })
  @IsOptional()
  @IsArray({ message: 'topicIds должно быть массивом' })
  @ArrayUnique({ message: 'topicIds должны быть уникальными' })
  @Type(() => Number)
  @IsInt({
    each: true,
    message: 'Каждый элемент topicIds должен быть целым числом',
  })
  topicIds?: number[];
}
