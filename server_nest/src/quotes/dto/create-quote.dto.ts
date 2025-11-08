import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsInt,
  MinLength,
} from 'class-validator';

/**
 * DTO для создания цитаты
 */
export class CreateQuoteDto {
  @ApiProperty({
    description: 'Текст цитаты на арабском языке',
    example: 'العلم نور والجهل ظلام',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  text_ar!: string;

  @ApiPropertyOptional({
    description: 'Текст цитаты на русском языке',
    example: 'Знание - это свет, а невежество - тьма',
    type: String,
  })
  @IsString()
  @IsOptional()
  text_ru?: string;

  @ApiPropertyOptional({
    description: 'ID личности, связанной с цитатой',
    example: 1,
    type: Number,
    nullable: true,
  })
  @IsOptional()
  @IsInt()
  personalityId?: number | null;
}
