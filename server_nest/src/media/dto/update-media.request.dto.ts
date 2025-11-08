import { ApiPropertyOptional } from '@nestjs/swagger';
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

export class UpdateMediaRequestDto {
  @ApiPropertyOptional({
    example: 'New video title',
    description: 'Новое название',
  })
  @IsOptional()
  @IsString({ message: 'Название должно быть строкой' })
  @MaxLength(300, { message: 'Название не может быть длиннее 300 символов' })
  title?: string;

  @ApiPropertyOptional({
    example: '/uploads/media/updated.mp4',
    description: 'Новый путь к медиа',
  })
  @IsOptional()
  @IsUrl(
    { require_tld: false },
    { message: 'mediaUrl должен быть корректным URL или путем' },
  )
  @MaxLength(500, { message: 'mediaUrl не может быть длиннее 500 символов' })
  mediaUrl?: string;

  @ApiPropertyOptional({
    example: '/uploads/media/thumbnails/updated.jpg',
    description: 'Новый путь к превью',
  })
  @IsOptional()
  @IsUrl(
    { require_tld: false },
    { message: 'previewUrl должен быть корректным URL или путем' },
  )
  @MaxLength(500, { message: 'previewUrl не может быть длиннее 500 символов' })
  previewUrl?: string;

  @ApiPropertyOptional({
    example: '/uploads/subs/updated.vtt',
    description: 'Новый путь к субтитрам',
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
    enum: MediaType,
    example: 'audio',
    description: 'Новый тип',
  })
  @IsOptional()
  @IsEnum(MediaType, { message: 'type должен быть допустимым значением' })
  type?: MediaType;

  @ApiPropertyOptional({ example: 12, description: 'Новый ID диалекта' })
  @IsOptional()
  @IsInt({ message: 'dialectId должно быть целым числом' })
  dialectId?: number;

  @ApiPropertyOptional({
    example: 'licensed',
    description: 'Новый тип лицензии',
  })
  @IsOptional()
  @IsString({ message: 'licenseType должно быть строкой' })
  @MaxLength(50, { message: 'licenseType не может быть длиннее 50 символов' })
  licenseType?: string;

  @ApiPropertyOptional({
    example: 'Studio Oasis',
    description: 'Новый автор лицензии',
  })
  @IsOptional()
  @IsString({ message: 'licenseAuthor должно быть строкой' })
  @MaxLength(200, {
    message: 'licenseAuthor не может быть длиннее 200 символов',
  })
  licenseAuthor?: string;

  @ApiPropertyOptional({ enum: MediaLevel, description: 'Новый уровень' })
  @IsOptional()
  @IsEnum(MediaLevel, { message: 'level должен быть допустимым значением' })
  level?: MediaLevel;

  @ApiPropertyOptional({ example: 5, description: 'Новый ID группы диалогов' })
  @IsOptional()
  @IsInt({ message: 'dialogueGroupId должно быть целым числом' })
  dialogueGroupId?: number;

  @ApiPropertyOptional({
    example: '00:03:24',
    description: 'Новая длительность',
  })
  @IsOptional()
  @IsString({ message: 'duration должно быть строкой' })
  @MaxLength(20, { message: 'duration не может быть длиннее 20 символов' })
  duration?: string;

  @ApiPropertyOptional({ example: 'Mahmoud', description: 'Новый говорящий' })
  @IsOptional()
  @IsString({ message: 'speaker должно быть строкой' })
  @MaxLength(200, { message: 'speaker не может быть длиннее 200 символов' })
  speaker?: string;

  @ApiPropertyOptional({
    example: 'partner',
    description: 'Новая роль источника',
  })
  @IsOptional()
  @IsString({ message: 'sourceRole должно быть строкой' })
  @MaxLength(100, { message: 'sourceRole не может быть длиннее 100 символов' })
  sourceRole?: string;

  @ApiPropertyOptional({
    example: 'https://example.com',
    description: 'Новая ссылка на грамматику',
  })
  @IsOptional()
  @IsUrl(
    { require_tld: false },
    { message: 'grammarLink должен быть корректным URL или путем' },
  )
  @MaxLength(500, { message: 'grammarLink не может быть длиннее 500 символов' })
  grammarLink?: string;

  @ApiPropertyOptional({
    type: 'object',
    additionalProperties: true,
    example: { pdf: '/uploads/media/extra.pdf' },
    description: 'Новые дополнительные ресурсы',
  })
  @IsOptional()
  @ValidateNested()
  resources?: Record<string, any>;

  @ApiPropertyOptional({ example: [2, 7, 9], description: 'Новые ID топиков' })
  @IsOptional()
  @IsArray({ message: 'topicIds должно быть массивом' })
  @ArrayUnique({ message: 'topicIds должны быть уникальными' })
  @IsInt({
    each: true,
    message: 'Каждый элемент topicIds должен быть целым числом',
  })
  topicIds?: number[];
}
