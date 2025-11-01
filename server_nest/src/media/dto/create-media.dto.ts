import {
  IsString,
  IsOptional,
  IsInt,
  IsArray,
  ArrayNotEmpty,
  ArrayUnique,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum MediaRegion {
  NORTH = 'north',
  SOUTH = 'south',
  EAST = 'east',
  WEST = 'west',
}

export class CreateMediaDto {
  @ApiProperty({ example: 'Traditional Wedding Song' })
  @IsString()
  title!: string;

  @ApiProperty({
    example: 'A rare dialect folk performance',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 'north',
    enum: MediaRegion,
    required: false,
  })
  @IsOptional()
  @IsEnum(MediaRegion)
  region?: MediaRegion;

  @ApiProperty({
    example: [1, 2, 5],
    description: 'ID тематических тегов (topics)',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsInt({ each: true })
  topicIds?: number[];

  @ApiProperty({
    example: '/uploads/media/1700000000_video.mp4',
    required: false,
  })
  @IsOptional()
  @IsString()
  mediaUrl?: string;

  @ApiProperty({
    example: '/uploads/media/previews/1700000000.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  previewUrl?: string;
}
