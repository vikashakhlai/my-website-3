import { ApiProperty } from '@nestjs/swagger';

export class BookRefDto {
  @ApiProperty({ example: 1, description: 'ID книги' })
  id!: number;

  @ApiProperty({ example: 'Канон медицины', description: 'Название книги' })
  title!: string;

  @ApiProperty({
    example: 'Классический труд по медицине',
    description: 'Описание книги',
  })
  description!: string;

  @ApiProperty({ example: 1020, description: 'Год публикации' })
  publication_year!: number;

  @ApiProperty({
    example: '/uploads/books/default-cover.jpg',
    description: 'Обложка книги',
  })
  cover_url!: string | null;
}
