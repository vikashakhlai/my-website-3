import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateQuoteDto {
  @ApiProperty({
    example: 'العلم نور',
    description: 'Цитата на арабском',
  })
  @IsString({ message: 'Текст на арабском должен быть строкой' })
  @IsNotEmpty({ message: 'Текст на арабском не может быть пустым' })
  @MaxLength(10000, {
    message: 'Текст на арабском не может быть длиннее 10000 символов',
  })
  text_ar!: string;

  @ApiPropertyOptional({
    example: 'Наука — это свет',
    description: 'Цитата на русском (необязательно)',
  })
  @IsOptional()
  @IsString({ message: 'Текст на русском должен быть строкой' })
  @MaxLength(10000, {
    message: 'Текст на русском не может быть длиннее 10000 символов',
  })
  text_ru?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'ID личности (необязательно)',
  })
  @IsOptional()
  @IsInt({ message: 'ID личности должен быть числом' })
  personalityId?: number | null;
}
