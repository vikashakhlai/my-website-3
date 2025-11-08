import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { NormalizedAuthor, NormalizedTag } from '../books.types';

export class BookResponseDto {
  @ApiProperty({ example: 1, description: 'ID книги' })
  @Expose()
  id!: number;

  @ApiProperty({ example: 'История ислама', description: 'Название' })
  @Expose()
  title!: string;

  @ApiProperty({
    example: 'Исчерпывающее исследование истории ислама',
    nullable: true,
    description: 'Описание',
  })
  @Expose()
  description!: string | null;

  @ApiProperty({ example: 2023, nullable: true, description: 'Год публикации' })
  @Expose()
  publication_year!: number | null;

  @ApiProperty({
    example: '/uploads/books/cover.jpg',
    nullable: true,
    description: 'Ссылка на обложку',
  })
  @Expose()
  cover_url!: string | null;

  @ApiProperty({
    example: 450,
    nullable: true,
    description: 'Количество страниц',
  })
  @Expose()
  pages!: number | null;

  @ApiProperty({ example: 1, nullable: true, description: 'ID издательства' })
  @Expose()
  publisher_id!: number | null;

  @ApiProperty({
    example: '2024-01-20T18:23:10.000Z',
    description: 'Дата создания',
  })
  @Expose()
  created_at!: string;

  @ApiProperty({ type: [() => NormalizedAuthor], description: 'Авторы' })
  @Expose()
  @Type(() => NormalizedAuthor)
  authors!: NormalizedAuthor[];

  @ApiProperty({ type: [() => NormalizedTag], description: 'Теги' })
  @Expose()
  @Type(() => NormalizedTag)
  tags!: NormalizedTag[];

  @ApiProperty({ example: 4.7, nullable: true, description: 'Средний рейтинг' })
  @Expose()
  averageRating!: number | null;

  @ApiProperty({ example: 128, description: 'Количество оценок' })
  @Expose()
  ratingCount!: number;

  @ApiProperty({
    example: true,
    description: 'В избранном ли книга у пользователя',
  })
  @Expose()
  isFavorite!: boolean;

  @ApiProperty({
    example: 5,
    nullable: true,
    description: 'Оценка пользователя',
  })
  @Expose()
  userRating!: number | null;
}
