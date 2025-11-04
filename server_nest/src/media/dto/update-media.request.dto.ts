import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  ArrayUnique,
  MaxLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { MediaType } from './media-type.enum';
import { MediaLevel } from './media-level.enum';

export class UpdateMediaRequestDto {
  @ApiPropertyOptional({ example: 'New video title' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  title?: string;

  @ApiPropertyOptional({ example: '/uploads/media/updated.mp4' })
  @IsOptional()
  @IsString()
  mediaUrl?: string;

  @ApiPropertyOptional({ example: '/uploads/media/thumbnails/updated.jpg' })
  @IsOptional()
  @IsString()
  previewUrl?: string;

  @ApiPropertyOptional({ example: '/uploads/subs/updated.vtt' })
  @IsOptional()
  @IsString()
  subtitlesLink?: string;

  @ApiPropertyOptional({ enum: MediaType, example: 'audio' })
  @IsOptional()
  @IsEnum(MediaType)
  type?: MediaType;

  @ApiPropertyOptional({ example: 12 })
  @IsOptional()
  @IsInt()
  dialectId?: number;

  @ApiPropertyOptional({ example: 'licensed' })
  @IsOptional()
  @IsString()
  licenseType?: string;

  @ApiPropertyOptional({ example: 'Studio Oasis' })
  @IsOptional()
  @IsString()
  licenseAuthor?: string;

  @ApiPropertyOptional({ enum: MediaLevel })
  @IsOptional()
  @IsEnum(MediaLevel)
  level?: MediaLevel;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsInt()
  dialogueGroupId?: number;

  @ApiPropertyOptional({ example: '00:03:24' })
  @IsOptional()
  @IsString()
  duration?: string;

  @ApiPropertyOptional({ example: 'Mahmoud' })
  @IsOptional()
  @IsString()
  speaker?: string;

  @ApiPropertyOptional({ example: 'partner' })
  @IsOptional()
  @IsString()
  sourceRole?: string;

  @ApiPropertyOptional({ example: 'https://example.com' })
  @IsOptional()
  @IsString()
  grammarLink?: string;

  @ApiPropertyOptional({
    type: 'object',
    additionalProperties: true,
    example: { pdf: '/uploads/media/extra.pdf' },
  })
  @IsOptional()
  resources?: Record<string, any>;

  @ApiPropertyOptional({ example: [2, 7, 9] })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsInt({ each: true })
  topicIds?: number[];
}
