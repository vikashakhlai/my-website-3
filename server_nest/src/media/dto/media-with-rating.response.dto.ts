import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { MediaResponseDto } from './media.response.dto';

/**
 * DTO для представления медиа-контента с рейтингами в ответе API
 * 
 * Расширяет MediaResponseDto, добавляя информацию о рейтингах.
 * Используется для эндпоинтов, где требуется информация о рейтингах.
 * 
 * @example
 * {
 *   ...MediaResponseDto fields...,
 *   "averageRating": 4.7,
 *   "votes": 128,
 *   "userRating": 5
 * }
 */
export class MediaWithRatingResponseDto extends MediaResponseDto {
  @ApiProperty({
    description: 'Средний рейтинг медиа-контента (от 1 до 5)',
    example: 4.7,
    type: Number,
  })
  @Expose()
  averageRating!: number;

  @ApiProperty({
    description: 'Количество оценок, поставленных медиа-контенту',
    example: 128,
    type: Number,
  })
  @Expose()
  votes!: number;

  @ApiPropertyOptional({
    description: 'Оценка текущего пользователя (от 1 до 5). Присутствует только если пользователь авторизован и оценил медиа-контент',
    example: 5,
    type: Number,
    nullable: true,
  })
  @Expose()
  userRating!: number | null;
}
