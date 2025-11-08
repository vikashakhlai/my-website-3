import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

/**
 * DTO для информации о личности в контексте цитаты
 */
export class QuotePersonalityRefDto {
  @ApiProperty({
    description: 'Уникальный идентификатор личности',
    example: 1,
    type: Number,
  })
  @Expose()
  id!: number;

  @ApiProperty({
    description: 'Полное имя личности',
    example: 'Аль-Фараби',
    type: String,
  })
  @Expose()
  name!: string;

  @ApiPropertyOptional({
    description: 'Должность или статус личности',
    example: 'Философ, математик',
    type: String,
  })
  @Expose()
  position?: string;
}

/**
 * DTO для ответа с информацией о цитате
 */
export class QuoteResponseDto {
  @ApiProperty({
    description: 'Уникальный идентификатор цитаты',
    example: 1,
    type: Number,
  })
  @Expose()
  id!: number;

  @ApiProperty({
    description: 'Текст цитаты на арабском языке',
    example: 'العلم نور والجهل ظلام',
    type: String,
  })
  @Expose()
  text_ar!: string;

  @ApiPropertyOptional({
    description: 'Текст цитаты на русском языке',
    example: 'Знание - это свет, а невежество - тьма',
    type: String,
    nullable: true,
  })
  @Expose()
  text_ru!: string | null;

  @ApiPropertyOptional({
    description: 'Информация о личности, связанной с цитатой',
    type: QuotePersonalityRefDto,
    nullable: true,
    example: {
      id: 1,
      name: 'Аль-Фараби',
      position: 'Философ, математик',
    },
  })
  @Expose()
  @Type(() => QuotePersonalityRefDto)
  personality!: QuotePersonalityRefDto | null;
}

