import { ApiProperty } from '@nestjs/swagger';

export class ArticleRefDto {
  @ApiProperty({ example: 1, description: 'ID статьи' })
  id!: number;

  @ApiProperty({
    example: 'Вклад Ибн Сины в философию',
    description: 'Название статьи',
  })
  title!: string;

  @ApiProperty({
    example: '2023-10-15T12:00:00.000Z',
    description: 'Дата публикации',
  })
  created_at!: string;
}
