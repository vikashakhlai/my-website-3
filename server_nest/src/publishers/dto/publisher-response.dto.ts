import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

/**
 * DTO для ссылки на книгу в контексте издательства
 */
export class PublisherBookRefDto {
  @ApiProperty({
    description: 'Уникальный идентификатор книги',
    example: 1,
    type: Number,
  })
  @Expose()
  id!: number;

  @ApiProperty({
    description: 'Название книги',
    example: 'ديوان أحمد شوقي',
    type: String,
  })
  @Expose()
  title!: string;

  @ApiPropertyOptional({
    description: 'Год публикации',
    example: 2020,
    type: Number,
    nullable: true,
  })
  @Expose()
  publication_year!: number | null;

  @ApiPropertyOptional({
    description: 'URL обложки книги',
    example: '/uploads/book_covers/book.jpg',
    type: String,
    nullable: true,
  })
  @Expose()
  cover_url!: string | null;
}

/**
 * DTO для ответа с информацией об издательстве
 */
export class PublisherResponseDto {
  @ApiProperty({
    description: 'Уникальный идентификатор издательства',
    example: 1,
    type: Number,
  })
  @Expose()
  id!: number;

  @ApiProperty({
    description: 'Название издательства',
    example: 'دار الشروق',
    type: String,
  })
  @Expose()
  name!: string;

  @ApiPropertyOptional({
    description: 'Список книг, изданных этим издательством',
    type: [PublisherBookRefDto],
    example: [
      {
        id: 1,
        title: 'ديوان أحمد شوقي',
        publication_year: 1927,
        cover_url: '/uploads/books/diwan-ahmed-shawki.jpg',
      },
    ],
  })
  @Expose()
  @Type(() => PublisherBookRefDto)
  books?: PublisherBookRefDto[];
}

