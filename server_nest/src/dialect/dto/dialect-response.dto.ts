import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

/**
 * DTO для представления медиа, связанного с диалектом
 */
export class DialectMediaRefDto {
  @ApiProperty({
    description: 'Идентификатор медиа',
    example: 1,
    type: Number,
  })
  @Expose()
  id!: number;

  @ApiProperty({
    description: 'Название медиа',
    example: 'Видео о диалекте',
    type: String,
  })
  @Expose()
  title!: string;
}

/**
 * DTO для представления диалекта в ответе API
 *
 * Диалект представляет собой региональный вариант арабского языка.
 * Может быть связан с несколькими медиа-файлами (видео, аудио).
 *
 * @example
 * {
 *   "id": 1,
 *   "name": "Египетский диалект",
 *   "slug": "egyptian",
 *   "description": "Диалект, распространённый в Египте",
 *   "region": "Египет",
 *   "createdAt": "2024-01-15T10:30:00.000Z",
 *   "updatedAt": "2024-01-15T10:30:00.000Z",
 *   "medias": [
 *     {
 *       "id": 5,
 *       "title": "Видео о египетском диалекте"
 *     }
 *   ]
 * }
 */
export class DialectResponseDto {
  @ApiProperty({
    description: 'Уникальный идентификатор диалекта',
    example: 1,
    type: Number,
  })
  @Expose()
  id!: number;

  @ApiProperty({
    description: 'Название диалекта',
    example: 'Египетский диалект',
    type: String,
  })
  @Expose()
  name!: string;

  @ApiProperty({
    description: 'URL-дружественный идентификатор диалекта',
    example: 'egyptian',
    type: String,
  })
  @Expose()
  slug!: string;

  @ApiPropertyOptional({
    description: 'Описание диалекта',
    example: 'Диалект, распространённый в Египте и других странах региона',
    type: String,
    nullable: true,
  })
  @Expose()
  description?: string | null;

  @ApiPropertyOptional({
    description: 'Регион, где распространён диалект',
    example: 'Египет',
    type: String,
    nullable: true,
  })
  @Expose()
  region?: string | null;

  @ApiProperty({
    description: 'Дата и время создания записи',
    example: '2024-01-15T10:30:00.000Z',
    type: Date,
  })
  @Expose()
  createdAt!: Date;

  @ApiProperty({
    description: 'Дата и время последнего обновления записи',
    example: '2024-01-15T10:30:00.000Z',
    type: Date,
  })
  @Expose()
  updatedAt!: Date;

  @ApiPropertyOptional({
    description: 'Список медиа-файлов, связанных с диалектом',
    type: [DialectMediaRefDto],
    example: [
      {
        id: 5,
        title: 'Диалог о подготовке к свадьбе (египетский диалект)',
      },
    ],
  })
  @Expose()
  @Type(() => DialectMediaRefDto)
  medias?: DialectMediaRefDto[];
}

