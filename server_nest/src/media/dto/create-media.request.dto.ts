import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  ArrayUnique,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { MediaType } from './media-type.enum';
import { MediaLevel } from './media-level.enum';

export class CreateMediaRequestDto {
  @ApiProperty({ example: 'Traditional Wedding Song' })
  @IsString()
  title!: string;

  @ApiPropertyOptional({ example: '/uploads/media/file.mp4', nullable: true })
  @IsOptional()
  @IsString()
  mediaUrl?: string;

  @ApiPropertyOptional({
    example: '/uploads/media/thumbnails/file.jpg',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  previewUrl?: string;

  @ApiPropertyOptional({ enum: MediaType, example: MediaType.VIDEO })
  @IsOptional()
  @IsEnum(MediaType)
  type?: MediaType;

  @ApiPropertyOptional({ example: '/uploads/subs/file.vtt', nullable: true })
  @IsOptional()
  @IsString()
  subtitlesLink?: string;

  @ApiPropertyOptional({ example: '/uploads/grammar/file.pdf', nullable: true })
  @IsOptional()
  @IsString()
  grammarLink?: string;

  @ApiPropertyOptional({ enum: MediaLevel, example: MediaLevel.BEGINNER })
  @IsOptional()
  @IsEnum(MediaLevel)
  level?: MediaLevel;

  @ApiPropertyOptional({
    type: 'object',
    additionalProperties: true,
    example: { pdf: '/file.pdf' },
    nullable: true,
  })
  @IsOptional()
  resources?: Record<string, any>;

  @ApiPropertyOptional({
    example: 5,
    description: 'ID диалекта',
    nullable: true,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  dialectId?: number;

  @ApiPropertyOptional({ example: 'public' })
  @IsOptional()
  @IsString()
  licenseType?: string;

  @ApiPropertyOptional({ example: 'Al Jazeera', nullable: true })
  @IsOptional()
  @IsString()
  licenseAuthor?: string;

  @ApiPropertyOptional({ example: '00:03:24', nullable: true })
  @IsOptional()
  @IsString()
  duration?: string;

  @ApiPropertyOptional({ example: 'محمد', nullable: true })
  @IsOptional()
  @IsString()
  speaker?: string;

  @ApiPropertyOptional({ example: 'Эксклюзив Oasis', nullable: true })
  @IsOptional()
  @IsString()
  sourceRole?: string;

  @ApiPropertyOptional({
    example: 2,
    description: 'ID группы диалогов',
    nullable: true,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  dialogueGroupId?: number;

  @ApiPropertyOptional({
    example: [1, 3, 7],
    description: 'ID топиков',
    nullable: true,
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @Type(() => Number)
  @IsInt({ each: true })
  topicIds?: number[];
}
