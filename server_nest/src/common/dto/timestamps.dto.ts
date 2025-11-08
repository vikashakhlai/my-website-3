import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

/**
 * DTO для временных меток
 * 
 * Содержит только временные метки создания и обновления,
 * без идентификатора. Используется как базовый класс для
 * сущностей, которые не имеют числового ID.
 * 
 * @example
 * {
 *   "createdAt": "2024-01-01T10:00:00.000Z",
 *   "updatedAt": "2024-01-01T12:00:00.000Z"
 * }
 */
export class TimestampsDto {
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
