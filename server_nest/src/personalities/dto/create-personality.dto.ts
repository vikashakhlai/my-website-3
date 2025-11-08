import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsString } from 'class-validator';
import { Era } from '../personality.entity';

import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, MaxLength, MinLength } from 'class-validator';

export class CreatePersonalityDto {
  @ApiProperty({
    example: 'Ибн Сина',
    description: 'Имя личности',
  })
  @IsString({ message: 'Имя должно быть строкой' })
  @MinLength(2, { message: 'Имя должно быть не менее 2 символов' })
  @MaxLength(255, { message: 'Имя не может быть длиннее 255 символов' })
  name!: string;

  @ApiPropertyOptional({
    example: '980 - 1037',
    description: 'Годы жизни (например, 980 - 1037)',
  })
  @IsOptional()
  @IsString({ message: 'Годы жизни должны быть строкой' })
  @MaxLength(50, {
    message: 'Поле "годы жизни" не может быть длиннее 50 символов',
  })
  years?: string;

  @ApiPropertyOptional({
    example: 'Философ, врач, учёный',
    description: 'Должность или роль',
  })
  @IsOptional()
  @IsString({ message: 'Должность должна быть строкой' })
  @MaxLength(255, { message: 'Должность не может быть длиннее 255 символов' })
  position?: string;

  @ApiPropertyOptional({
    example:
      'Абу Али аль-Хусейн ибн Абдаллах ибн аль-Хасан ибн Али ибн Сины...',
    description: 'Биография',
  })
  @IsOptional()
  @IsString({ message: 'Биография должна быть строкой' })
  @MaxLength(50000, {
    message: 'Биография не может быть длиннее 50000 символов',
  })
  biography?: string;

  @ApiPropertyOptional({
    type: [String],
    example: ['Известен как Авиценна в Европе', 'Автор "Канона медицины"'],
    description: 'Факты о личности',
  })
  @IsOptional()
  @IsArray({ message: 'Факты должны быть массивом строк' })
  @IsString({ each: true, message: 'Каждый факт должен быть строкой' })
  facts?: string[];

  @ApiProperty({
    enum: Era,
    example: Era.ABBASID,
    description: 'Эпоха, к которой относится личность',
  })
  @IsEnum(Era, { message: 'Эпоха должна быть допустимой' })
  era!: Era;

  @ApiPropertyOptional({
    example: '/uploads/personalities_photos/default.webp',
    description: 'URL изображения',
  })
  @IsOptional()
  @IsString({ message: 'URL изображения должен быть строкой' })
  @MaxLength(512, {
    message: 'URL изображения не может быть длиннее 512 символов',
  })
  imageUrl?: string;

  @ApiPropertyOptional({
    type: [Number],
    example: [1, 2, 3],
    description: 'Массив ID книг, связанных с личностью',
  })
  @IsOptional()
  @IsArray({ message: 'IDs книг должны быть массивом чисел' })
  bookIds?: number[];

  @ApiPropertyOptional({
    type: [Number],
    example: [1, 2],
    description: 'Массив ID статей, связанных с личностью',
  })
  @IsOptional()
  @IsArray({ message: 'IDs статей должны быть массивом чисел' })
  articleIds?: number[];
}
