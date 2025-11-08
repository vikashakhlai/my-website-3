import { IsInt, IsOptional, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/**
 * DTO для пагинации запросов
 * 
 * Ограничивает количество записей на странице для предотвращения
 * перегрузки сервера и злоупотреблений.
 * 
 * @example
 * {
 *   "page": 1,
 *   "limit": 20
 * }
 */
export class PaginationDto {
  @ApiPropertyOptional({
    description: 'Номер страницы (начиная с 1)',
    example: 1,
    type: Number,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({
    description: 'Количество записей на странице. Максимум 100 для предотвращения перегрузки сервера',
    example: 20,
    type: Number,
    minimum: 1,
    maximum: 100,
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;
}
