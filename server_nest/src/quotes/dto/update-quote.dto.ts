import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateQuoteDto {
  @ApiPropertyOptional({
    example: 'العلم نور',
    description: 'Новый текст на арабском',
  })
  @IsOptional()
  @IsString({ message: 'Текст на арабском должен быть строкой' })
  @MaxLength(10000, {
    message: 'Текст на арабском не может быть длиннее 10000 символов',
  })
  text_ar?: string;

  @ApiPropertyOptional({
    example: 'Наука — это свет',
    description: 'Новый текст на русском',
  })
  @IsOptional()
  @IsString({ message: 'Текст на русском должен быть строкой' })
  @MaxLength(10000, {
    message: 'Текст на русском не может быть длиннее 10000 символов',
  })
  text_ru?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Новый ID личности (null для удаления связи)',
  })
  @IsOptional()
  @IsInt({ message: 'ID личности должен быть числом' })
  personalityId?: number | null;
}
