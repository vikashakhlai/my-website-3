import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

/**
 * DTO для представления реплики в диалоге
 *
 * Реплика представляет собой одну строку диалога из медиа-файла.
 *
 * @example
 * {
 *   "id": 1,
 *   "textOriginal": "مرحبا، كيف حالك؟",
 *   "speakerName": "Ахмед",
 *   "orderIndex": 1,
 *   "createdAt": "2024-01-15T10:30:00.000Z",
 *   "updatedAt": "2024-01-15T10:30:00.000Z"
 * }
 */
export class DialogueScriptResponseDto {
  @ApiProperty({
    description: 'Уникальный идентификатор реплики',
    example: 1,
    type: Number,
  })
  @Expose()
  id!: number;

  @ApiProperty({
    description: 'Оригинальный текст реплики (на арабском языке)',
    example: 'مرحبا، كيف حالك؟',
    type: String,
  })
  @Expose()
  textOriginal!: string;

  @ApiPropertyOptional({
    description: 'Имя говорящего (если указано)',
    example: 'Ахмед',
    type: String,
    nullable: true,
  })
  @Expose()
  speakerName?: string | null;

  @ApiPropertyOptional({
    description: 'Порядковый номер реплики в диалоге',
    example: 1,
    type: Number,
    nullable: true,
  })
  @Expose()
  orderIndex?: number | null;

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
}

