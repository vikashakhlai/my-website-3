import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsString,
  IsOptional,
  IsNotEmpty,
  MinLength,
  MaxLength,
  ArrayMinSize,
} from 'class-validator';
import { Era } from '../personality.entity';

/**
 * DTO для создания личности
 */
export class CreatePersonalityDto {
  @ApiProperty({
    description: 'Имя личности',
    example: 'Аль-Фараби',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(255)
  name!: string;

  @ApiPropertyOptional({
    description: 'Годы жизни',
    example: '870-950',
    type: String,
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  years?: string;

  @ApiPropertyOptional({
    description: 'Должность или статус',
    example: 'Философ, математик',
    type: String,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  position?: string;

  @ApiPropertyOptional({
    description: 'Биография личности',
    example: 'Абу Наср Мухаммад ибн Мухаммад аль-Фараби, известный как аль-Фараби, был выдающимся философом, математиком, музыковедом и ученым эпохи Аббасидов. Родился в Фарабе (современный Казахстан), получил образование в Багдаде. Считается одним из величайших философов исламского мира, известен как "Второй учитель" после Аристотеля.',
    type: String,
  })
  @IsString()
  @IsOptional()
  biography?: string;

  @ApiPropertyOptional({
    description: 'Интересные факты о личности',
    example: [
      'Аль-Фараби написал более 100 работ по философии, логике, музыке и политике',
      'Он был первым, кто систематически изучил и классифицировал науки в исламском мире',
      'Его работы оказали значительное влияние на европейскую философию эпохи Возрождения',
    ],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  facts?: string[];

  @ApiPropertyOptional({
    description: 'Историческая эпоха',
    enum: Era,
    example: Era.ABBASID,
  })
  @IsEnum(Era)
  @IsOptional()
  era?: Era;

  @ApiPropertyOptional({
    description: 'URL изображения личности',
    example: '/uploads/personalities_photoes/al-farabi.webp',
    type: String,
  })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiPropertyOptional({
    description: 'Список ID книг, связанных с личностью',
    type: [Number],
    example: [1, 2, 3],
  })
  @IsArray()
  @IsOptional()
  bookIds?: number[];

  @ApiPropertyOptional({
    description: 'Список ID статей, связанных с личностью',
    type: [Number],
    example: [1, 2, 3],
  })
  @IsArray()
  @IsOptional()
  articleIds?: number[];
}

/**
 * DTO для обновления личности
 */
export class UpdatePersonalityDto {
  @ApiPropertyOptional({
    description: 'Имя личности',
    example: 'Аль-Фараби',
    type: String,
  })
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({
    description: 'Годы жизни',
    example: '870-950',
    type: String,
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  years?: string;

  @ApiPropertyOptional({
    description: 'Должность или статус',
    example: 'Философ, математик',
    type: String,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  position?: string;

  @ApiPropertyOptional({
    description: 'Биография личности',
    example: 'Абу Наср Мухаммад ибн Мухаммад аль-Фараби, известный как аль-Фараби, был выдающимся философом, математиком, музыковедом и ученым эпохи Аббасидов. Родился в Фарабе (современный Казахстан), получил образование в Багдаде. Считается одним из величайших философов исламского мира, известен как "Второй учитель" после Аристотеля.',
    type: String,
  })
  @IsString()
  @IsOptional()
  biography?: string;

  @ApiPropertyOptional({
    description: 'Интересные факты о личности',
    example: [
      'Аль-Фараби написал более 100 работ по философии, логике, музыке и политике',
      'Он был первым, кто систематически изучил и классифицировал науки в исламском мире',
      'Его работы оказали значительное влияние на европейскую философию эпохи Возрождения',
    ],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  facts?: string[];

  @ApiPropertyOptional({
    description: 'Историческая эпоха',
    enum: Era,
    example: Era.ABBASID,
  })
  @IsEnum(Era)
  @IsOptional()
  era?: Era;

  @ApiPropertyOptional({
    description: 'URL изображения личности',
    example: '/uploads/personalities_photoes/al-farabi.webp',
    type: String,
  })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiPropertyOptional({
    description: 'Список ID книг, связанных с личностью',
    type: [Number],
    example: [1, 2, 3],
  })
  @IsArray()
  @IsOptional()
  bookIds?: number[];

  @ApiPropertyOptional({
    description: 'Список ID статей, связанных с личностью',
    type: [Number],
    example: [1, 2, 3],
  })
  @IsArray()
  @IsOptional()
  articleIds?: number[];
}
