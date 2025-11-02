import {
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  IsArray,
  ArrayUnique,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMediaDto {
  @ApiProperty({ example: 'Traditional Wedding Song' })
  @IsString()
  title!: string;

  @ApiProperty({
    example: '/uploads/media/1700000000_video.mp4',
    required: false,
  })
  @IsOptional()
  @IsString()
  mediaUrl?: string;

  @ApiProperty({
    example: '/uploads/media/thumbnails/1700000000-preview.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  previewUrl?: string;

  @ApiProperty({
    example: 'video',
    enum: ['video', 'audio', 'text'],
    default: 'video',
  })
  @IsOptional()
  @IsEnum(['video', 'audio', 'text'])
  type?: 'video' | 'audio' | 'text';

  @ApiProperty({
    example: '/uploads/subtitles/1700000000.vtt',
    required: false,
  })
  @IsOptional()
  @IsString()
  subtitlesLink?: string;

  @ApiProperty({
    example: '/uploads/grammar/files/1700000000.pdf',
    required: false,
  })
  @IsOptional()
  @IsString()
  grammarLink?: string;

  @ApiProperty({
    example: 'beginner',
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner',
  })
  @IsOptional()
  @IsEnum(['beginner', 'intermediate', 'advanced'])
  level?: 'beginner' | 'intermediate' | 'advanced';

  @ApiProperty({
    example: { pdf: '/uploads/res/sheet1.pdf', extra: true },
    required: false,
  })
  @IsOptional()
  resources?: Record<string, any>;

  @ApiProperty({
    example: 5,
    required: false,
    description: 'ID диалекта из таблицы dialects',
  })
  @IsOptional()
  @IsInt()
  dialectId?: number;

  @ApiProperty({
    example: 'public',
    required: false,
  })
  @IsOptional()
  @IsString()
  licenseType?: string;

  @ApiProperty({
    example: 'Al Jazeera',
    required: false,
  })
  @IsOptional()
  @IsString()
  licenseAuthor?: string;

  @ApiProperty({
    example: '03:24',
    required: false,
  })
  @IsOptional()
  @IsString()
  duration?: string;

  @ApiProperty({
    example: 'محمد',
    required: false,
  })
  @IsOptional()
  @IsString()
  speaker?: string;

  @ApiProperty({
    example: 'Предоставлено партнёром',
    required: false,
  })
  @IsOptional()
  @IsString()
  sourceRole?: string;

  @ApiProperty({
    example: 2,
    required: false,
    description: 'ID группы диалогов',
  })
  @IsOptional()
  @IsInt()
  dialogueGroupId?: number;

  @ApiProperty({
    example: [1, 3, 7],
    required: false,
    description: 'ID тематики из таблицы dialect_topics',
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsInt({ each: true })
  topicIds?: number[];
}
