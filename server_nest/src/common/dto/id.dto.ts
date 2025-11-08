import { IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/**
 * DTO для валидации числового идентификатора
 * 
 * Используется для параметров пути, содержащих ID сущности.
 * Гарантирует, что ID является положительным целым числом.
 * 
 * @example
 * {
 *   "id": 1
 * }
 */
export class IdDto {
  @ApiProperty({
    description: 'Уникальный идентификатор сущности',
    example: 1,
    type: Number,
    minimum: 1,
  })
  @Type(() => Number)
  @IsInt({ message: 'ID должен быть целым числом' })
  @Min(1, { message: 'ID должен быть положительным числом' })
  id!: number;
}
