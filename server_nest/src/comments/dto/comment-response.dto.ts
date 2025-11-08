import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { TargetType } from 'src/common/enums/target-type.enum';

/**
 * DTO для представления пользователя в комментарии
 *
 * @example
 * {
 *   "id": "123e4567-e89b-12d3-a456-426614174000",
 *   "username": "user123",
 *   "avatar": "/uploads/avatars/user123.jpg"
 * }
 */
export class CommentUserDto {
  @ApiProperty({
    description: 'Уникальный идентификатор пользователя (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String,
  })
  @Expose()
  id!: string;

  @ApiProperty({
    description: 'Имя пользователя',
    example: 'user123',
    type: String,
  })
  @Expose()
  username!: string;

  @ApiPropertyOptional({
    description: 'URL аватара пользователя',
    example: '/uploads/avatars/user123.jpg',
    type: String,
    nullable: true,
  })
  @Expose()
  avatar?: string | null;
}

/**
 * DTO для представления комментария в ответе API
 *
 * Комментарии поддерживают вложенность (ответы на комментарии).
 * Каждый комментарий может иметь реакции (лайки/дизлайки).
 *
 * @example
 * {
 *   "id": 1,
 *   "user": {
 *     "id": "123e4567-e89b-12d3-a456-426614174000",
 *     "username": "user123",
 *     "avatar": "/uploads/avatars/user123.jpg"
 *   },
 *   "target_type": "article",
 *   "target_id": 5,
 *   "content": "Отличная статья!",
 *   "likes_count": 10,
 *   "dislikes_count": 2,
 *   "parent_id": null,
 *   "replies": [],
 *   "my_reaction": 1,
 *   "created_at": "2024-01-15T10:30:00.000Z",
 *   "updated_at": "2024-01-15T10:30:00.000Z"
 * }
 */
export class CommentResponseDto {
  @ApiProperty({
    description: 'Уникальный идентификатор комментария',
    example: 1,
    type: Number,
  })
  @Expose()
  id!: number;

  @ApiProperty({
    description: 'Информация о пользователе, оставившем комментарий',
    type: CommentUserDto,
  })
  @Expose()
  @Type(() => CommentUserDto)
  user!: CommentUserDto;

  @ApiProperty({
    description: 'Тип сущности, к которой привязан комментарий',
    enum: TargetType,
    example: TargetType.ARTICLE,
  })
  @Expose()
  target_type!: TargetType;

  @ApiProperty({
    description: 'Идентификатор сущности, к которой привязан комментарий',
    example: 5,
    type: Number,
  })
  @Expose()
  target_id!: number;

  @ApiProperty({
    description: 'Текст комментария (очищенный от HTML)',
    example: 'Отличная статья! Очень полезная информация.',
    type: String,
  })
  @Expose()
  content!: string;

  @ApiProperty({
    description: 'Количество лайков',
    example: 10,
    type: Number,
    default: 0,
  })
  @Expose()
  likes_count!: number;

  @ApiProperty({
    description: 'Количество дизлайков',
    example: 2,
    type: Number,
    default: 0,
  })
  @Expose()
  dislikes_count!: number;

  @ApiPropertyOptional({
    description: 'Идентификатор родительского комментария (если это ответ)',
    example: null,
    type: Number,
    nullable: true,
  })
  @Expose()
  parent_id!: number | null;

  @ApiProperty({
    description: 'Список ответов на этот комментарий',
    type: [CommentResponseDto],
    default: [],
  })
  @Expose()
  @Type(() => CommentResponseDto)
  replies!: CommentResponseDto[];

  @ApiPropertyOptional({
    description:
      'Реакция текущего пользователя на комментарий. Присутствует только если пользователь авторизован. 1 = лайк, -1 = дизлайк, 0 = нет реакции',
    example: 1,
    enum: [1, -1, 0],
    nullable: true,
  })
  @Expose()
  my_reaction?: 1 | -1 | 0;

  @ApiProperty({
    description: 'Дата создания комментария',
    example: '2024-01-15T10:30:00.000Z',
    type: Date,
  })
  @Expose()
  created_at!: Date;

  @ApiProperty({
    description: 'Дата последнего обновления комментария',
    example: '2024-01-15T10:30:00.000Z',
    type: Date,
  })
  @Expose()
  updated_at!: Date;
}
