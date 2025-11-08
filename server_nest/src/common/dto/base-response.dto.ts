import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Базовый DTO для всех ответов API
 * 
 * Содержит общие поля, которые присутствуют во всех сущностях:
 * идентификатор и временные метки создания/обновления.
 * 
 * @example
 * {
 *   "id": 1,
 *   "createdAt": "2024-01-01T10:00:00.000Z",
 *   "updatedAt": "2024-01-01T12:00:00.000Z"
 * }
 */
export class BaseResponseDto {
  @ApiProperty({
    description: 'Уникальный идентификатор сущности',
    example: 1,
    type: Number,
  })
  @Expose()
  id!: number;

  @ApiProperty({
    description: 'Дата и время создания записи',
    example: '2024-01-01T10:00:00.000Z',
    type: Date,
  })
  @Expose()
  createdAt!: Date;

  @ApiProperty({
    description: 'Дата и время последнего обновления записи',
    example: '2024-01-01T12:00:00.000Z',
    type: Date,
  })
  @Expose()
  updatedAt!: Date;
}
