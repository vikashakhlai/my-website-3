import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { UserResponseDto } from 'src/user/dto/user-response.dto';

export class CommentResponseDto {
  @ApiProperty({ example: 1, description: 'ID комментария' })
  @Expose()
  id!: number;

  @ApiProperty({ type: UserResponseDto, description: 'Пользователь' })
  @Expose()
  @Type(() => UserResponseDto)
  user!: UserResponseDto;

  @ApiProperty({ example: 'textbook', description: 'Тип сущности' })
  @Expose()
  target_type!: string;

  @ApiProperty({ example: 1, description: 'ID сущности' })
  @Expose()
  target_id!: number;

  @ApiProperty({
    example: 'Это отличный учебник!',
    description: 'Содержимое комментария',
  })
  @Expose()
  content!: string;

  @ApiProperty({ example: 5, description: 'Количество лайков' })
  @Expose()
  likes_count!: number;

  @ApiProperty({ example: 0, description: 'Количество дизлайков' })
  @Expose()
  dislikes_count!: number;

  @ApiProperty({
    example: 10,
    nullable: true,
    description: 'ID родительского комментария',
  })
  @Expose()
  parent_id!: number | null;

  @ApiProperty({
    example: 1,
    nullable: true,
    description: 'Моя реакция: 1 (лайк), -1 (дизлайк), 0 (нет)',
  })
  @Expose()
  my_reaction!: 1 | -1 | 0;

  @ApiProperty({
    example: '2024-01-20T18:23:10.000Z',
    description: 'Дата создания',
  })
  @Expose()
  created_at!: string;

  @ApiProperty({
    example: '2024-02-01T09:55:03.000Z',
    description: 'Дата обновления',
  })
  @Expose()
  updated_at!: string;

  @ApiProperty({
    type: [() => CommentResponseDto],
    description: 'Ответы на комментарий',
  })
  @Expose()
  @Type(() => CommentResponseDto)
  replies!: CommentResponseDto[];
}
