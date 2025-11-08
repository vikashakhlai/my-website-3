import { IsOptional, IsString, MinLength, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO для поисковых запросов
 * 
 * Ограничивает длину поискового запроса для предотвращения
 * злоупотреблений и перегрузки сервера.
 * 
 * @example
 * {
 *   "q": "арабская грамматика"
 * }
 */
export class SearchDto {
  @ApiPropertyOptional({
    description: 'Поисковый запрос. Минимум 2 символа, максимум 200 символов',
    example: 'арабская грамматика',
    type: String,
    minLength: 2,
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Поисковый запрос должен содержать минимум 2 символа' })
  @MaxLength(200, { message: 'Поисковый запрос не может превышать 200 символов' })
  q?: string;
}
