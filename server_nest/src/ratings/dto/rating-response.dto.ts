import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { TargetType } from 'src/common/enums/target-type.enum';

/**
 * DTO для представления рейтинга в ответе API
 *
 * Используется для возврата информации о рейтинге, включая
 * среднее значение, количество голосов и оценку текущего пользователя.
 *
 * @example
 * {
 *   "id": 1,
 *   "target_type": "article",
 *   "target_id": 5,
 *   "value": 4,
 *   "user_id": "f9c9c6b4-8d0e-4b3b-a6b3-13a8f32d78b3",
 *   "created_at": "2024-01-15T10:30:00.000Z",
 *   "updated_at": "2024-01-15T10:30:00.000Z"
 * }
 */
export class RatingResponseDto {
  @ApiProperty({
    description: 'Уникальный идентификатор рейтинга',
    example: 1,
    type: Number,
  })
  @Expose()
  id!: number;

  @ApiProperty({
    description: 'Тип сущности, к которой относится рейтинг',
    enum: TargetType,
    example: TargetType.ARTICLE,
  })
  @Expose()
  target_type!: TargetType;

  @ApiProperty({
    description: 'Идентификатор сущности, к которой относится рейтинг',
    example: 5,
    type: Number,
  })
  @Expose()
  target_id!: number;

  @ApiProperty({
    description: 'Значение рейтинга (от 1 до 5)',
    example: 4,
    type: Number,
    minimum: 1,
    maximum: 5,
  })
  @Expose()
  value!: number;

  @ApiProperty({
    description: 'Идентификатор пользователя, поставившего рейтинг',
    example: 'f9c9c6b4-8d0e-4b3b-a6b3-13a8f32d78b3',
    type: String,
  })
  @Expose()
  user_id!: string;

  @ApiProperty({
    description: 'Дата и время создания рейтинга',
    example: '2024-01-15T10:30:00.000Z',
    type: Date,
  })
  @Expose()
  created_at!: Date;

  @ApiProperty({
    description: 'Дата и время последнего обновления рейтинга',
    example: '2024-01-15T10:30:00.000Z',
    type: Date,
  })
  @Expose()
  updated_at!: Date;
}

/**
 * DTO для статистики рейтинга
 *
 * Используется для возврата среднего рейтинга и количества голосов.
 *
 * @example
 * {
 *   "average": 4.5,
 *   "votes": 120
 * }
 */
export class RatingStatsDto {
  @ApiProperty({
    description: 'Средний рейтинг (от 1 до 5). Округлён до 2 знаков после запятой',
    example: 4.5,
    type: Number,
    nullable: true,
  })
  @Expose()
  average!: number | null;

  @ApiProperty({
    description: 'Количество оценок',
    example: 120,
    type: Number,
    default: 0,
  })
  @Expose()
  votes!: number;
}

/**
 * DTO для рейтинга с информацией о пользователе
 *
 * Расширяет RatingResponseDto информацией о пользователе.
 */
export class RatingWithUserDto extends RatingResponseDto {
  @ApiPropertyOptional({
    description: 'Имя пользователя, поставившего рейтинг',
    example: 'Иван Иванов',
    type: String,
  })
  @Expose()
  user?: {
    id: string;
    username?: string;
    email?: string;
  };
}

