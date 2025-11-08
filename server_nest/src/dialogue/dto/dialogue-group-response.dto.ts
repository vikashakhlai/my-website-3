import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { DialogueMediaResponseDto } from './dialogue-media-response.dto';

/**
 * DTO для представления группы диалогов в ответе API
 *
 * Группа диалогов объединяет несколько медиа-файлов (видео/аудио) по одной теме.
 * Каждая группа может содержать версии диалога на фусхе и различных диалектах.
 *
 * @example
 * {
 *   "id": 1,
 *   "title": "Диалог в ресторане",
 *   "description": "Разговор о заказе еды в ресторане",
 *   "baseLanguage": "fusha",
 *   "createdAt": "2024-01-15T10:30:00.000Z",
 *   "updatedAt": "2024-01-15T10:30:00.000Z",
 *   "medias": [
 *     {
 *       "id": 5,
 *       "title": "Диалог в ресторане (фусха)",
 *       "dialect": null,
 *       "scripts": [
 *         {
 *           "id": 1,
 *           "textOriginal": "مرحبا",
 *           "speakerName": "Официант",
 *           "orderIndex": 1
 *         }
 *       ]
 *     }
 *   ]
 * }
 */
export class DialogueGroupResponseDto {
  @ApiProperty({
    description: 'Уникальный идентификатор группы диалогов',
    example: 1,
    type: Number,
  })
  @Expose()
  id!: number;

  @ApiProperty({
    description: 'Название группы диалогов',
    example: 'Диалог в ресторане',
    type: String,
  })
  @Expose()
  title!: string;

  @ApiPropertyOptional({
    description: 'Описание группы диалогов',
    example: 'Разговор о заказе еды в ресторане',
    type: String,
    nullable: true,
  })
  @Expose()
  description?: string | null;

  @ApiProperty({
    description: 'Базовый язык диалога (обычно "fusha" - фусха)',
    example: 'fusha',
    type: String,
    default: 'fusha',
  })
  @Expose()
  baseLanguage!: string;

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
    description: 'Список медиа-файлов, связанных с группой диалогов',
    type: [DialogueMediaResponseDto],
    example: [
      {
        id: 5,
        title: 'Диалог в ресторане (фусха)',
        dialect: null,
        scripts: [
          {
            id: 1,
            textOriginal: 'مرحبا، كيف حالك؟',
            speakerName: 'Официант',
            orderIndex: 1,
            createdAt: '2024-01-15T10:30:00.000Z',
            updatedAt: '2024-01-15T10:30:00.000Z',
          },
        ],
      },
    ],
  })
  @Expose()
  @Type(() => DialogueMediaResponseDto)
  medias?: DialogueMediaResponseDto[];
}

