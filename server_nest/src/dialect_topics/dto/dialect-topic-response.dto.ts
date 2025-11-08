import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

/**
 * DTO для представления медиа, связанного с темой диалекта
 */
export class DialectTopicMediaRefDto {
  @ApiProperty({
    description: 'Идентификатор медиа',
    example: 1,
    type: Number,
  })
  @Expose()
  id!: number;

  @ApiProperty({
    description: 'Название медиа',
    example: 'Видео о теме',
    type: String,
  })
  @Expose()
  title!: string;
}

/**
 * DTO для представления темы диалекта в ответе API
 *
 * Тема диалекта представляет собой категорию для группировки медиа-контента
 * по тематике (например, "Приветствие", "Еда", "Путешествия").
 *
 * @example
 * {
 *   "id": 1,
 *   "name": "Приветствие",
 *   "medias": [
 *     {
 *       "id": 5,
 *       "title": "Видео о приветствиях"
 *     }
 *   ]
 * }
 */
export class DialectTopicResponseDto {
  @ApiProperty({
    description: 'Уникальный идентификатор темы диалекта',
    example: 1,
    type: Number,
  })
  @Expose()
  id!: number;

  @ApiProperty({
    description: 'Название темы. Должно быть уникальным в системе',
    example: 'Приветствие',
    type: String,
  })
  @Expose()
  name!: string;

  @ApiPropertyOptional({
    description: 'Список медиа-файлов, связанных с темой',
    type: [DialectTopicMediaRefDto],
    example: [
      {
        id: 5,
        title: 'Видео о приветствиях в египетском диалекте',
      },
    ],
  })
  @Expose()
  @Type(() => DialectTopicMediaRefDto)
  medias?: DialectTopicMediaRefDto[];
}

