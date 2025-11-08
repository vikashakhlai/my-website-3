import {
  ApiPropertyOptional,
} from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsInt,
  MinLength,
} from 'class-validator';

/**
 * DTO для обновления цитаты
 */
export class UpdateQuoteDto {
  @ApiPropertyOptional({
    description: 'Текст цитаты на арабском языке',
    example: 'العلم نور والجهل ظلام',
    type: String,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  text_ar?: string;

  @ApiPropertyOptional({
    description: 'Текст цитаты на русском языке',
    example: 'Знание - это свет, а невежество - тьма',
    type: String,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  text_ru?: string | null;

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
