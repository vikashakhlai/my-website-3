import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  ArrayUnique,
  IsIn,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { MediaType } from './media-type.enum';

export class UpdateMediaDto {
  @ApiPropertyOptional({ example: 'Dialogue in Egyptian Arabic' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  title?: string;

  @ApiPropertyOptional({ example: '/uploads/media/1700000000_video.mp4' })
  @IsOptional()
  @IsString()
  mediaUrl?: string;

  @ApiPropertyOptional({ example: '/uploads/media/thumbnails/1700000000.jpg' })
  @IsOptional()
  @IsString()
  previewUrl?: string;

  @ApiPropertyOptional({ example: '/uploads/subs/1700000000.vtt' })
  @IsOptional()
  @IsString()
  subtitlesLink?: string;

  @ApiPropertyOptional({
    example: 'video',
    enum: MediaType,
  })
  @IsOptional()
  @IsIn(Object.values(MediaType))
  type?: MediaType;

  @ApiPropertyOptional({ example: 12 })
  @IsOptional()
  @IsInt()
  dialectId?: number;

  @ApiPropertyOptional({ example: 'original' })
  @IsOptional()
  @IsString()
  licenseType?: string;

  @ApiPropertyOptional({ example: 'Studio Oasis' })
  @IsOptional()
  @IsString()
  licenseAuthor?: string;

  @ApiPropertyOptional({ example: 'advanced' })
  @IsOptional()
  @IsString()
  level?: string | null;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsInt()
  dialogueGroupId?: number | null;

  @ApiPropertyOptional({ example: '00:03:24' })
  @IsOptional()
  @IsString()
  duration?: string | null;

  @ApiPropertyOptional({ example: 'Mahmoud' })
  @IsOptional()
  @IsString()
  speaker?: string | null;

  @ApiPropertyOptional({ example: 'partner' })
  @IsOptional()
  @IsString()
  sourceRole?: string | null;

  @ApiPropertyOptional({ example: 'https://example.com/grammar/article' })
  @IsOptional()
  @IsString()
  grammarLink?: string | null;

  @ApiPropertyOptional({
    example: { pdf: '/uploads/media/extra.pdf', glossary: '/uploads/glo.json' },
    description: 'Произвольный JSON',
  })
  @IsOptional()
  resources?: Record<string, any> | null;

  @ApiPropertyOptional({
    example: [2, 7, 9],
    description: 'SYNC темы: новые добавятся, отсутствующие — удалятся',
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  topicIds?: number[];
}
