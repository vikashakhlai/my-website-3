import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

/**
 * DTO для запроса списка диалектов с фильтрацией
 *
 * Расширяет PaginationDto и добавляет фильтры по названию и региону.
 *
 * @example
 * {
 *   "page": 1,
 *   "limit": 10,
 *   "name": "египет",
 *   "region": "Египет"
 * }
 */
export class DialectQueryDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Фильтр по названию диалекта (поиск по подстроке, без учёта регистра)',
    example: 'египет',
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'Параметр name должен быть строкой' })
  name?: string;

  @ApiPropertyOptional({
    description: 'Фильтр по региону (поиск по подстроке, без учёта регистра)',
    example: 'Египет',
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'Параметр region должен быть строкой' })
  region?: string;
}

