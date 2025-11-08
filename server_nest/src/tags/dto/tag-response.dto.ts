import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

/**
 * DTO для представления тега в ответе API
 * 
 * Этот DTO используется для возврата информации о теге.
 * Теги используются для категоризации книг и других сущностей в системе.
 * 
 * @example
 * {
 *   "id": 5,
 *   "name": "Поэзия"
 * }
 */
export class TagResponseDto {
  @ApiProperty({
    description: 'Уникальный идентификатор тега',
    example: 5,
    type: Number,
  })
  @Expose()
  id!: number;

  @ApiProperty({
    description: 'Название тега. Должно быть уникальным в системе',
    example: 'Поэзия',
    type: String,
  })
  @Expose()
  name!: string;
}

