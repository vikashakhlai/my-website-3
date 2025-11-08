import { ApiProperty } from '@nestjs/swagger';

export class NotificationResponseDto {
  @ApiProperty({ example: 1, description: 'ID уведомления' })
  id!: number;

  @ApiProperty({ example: 'comment_reply', description: 'Тип уведомления' })
  type!: string;

  @ApiProperty({ example: 'comment', description: 'Тип сущности' })
  entity_type!: string;

  @ApiProperty({ example: 10, description: 'ID сущности' })
  entity_id!: number;

  @ApiProperty({
    example: 'Ваш комментарий получил ответ',
    description: 'Сообщение уведомления',
  })
  message!: string;

  @ApiProperty({ example: false, description: 'Прочитано ли уведомление' })
  is_read!: boolean;

  @ApiProperty({
    example: '2025-10-16T12:34:56.789Z',
    description: 'Дата создания',
  })
  created_at!: Date;
}
