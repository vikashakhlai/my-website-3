import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

/**
 * DTO для представления книги автора в ответе API
 *
 * @example
 * {
 *   "id": 1,
 *   "title": "ديوان أحمد شوقي",
 *   "coverUrl": "/uploads/books/diwan-ahmed-shawki.jpg",
 *   "publicationYear": 1927
 * }
 */
export class AuthorBookRefDto {
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
    description: 'URL обложки книги',
    example: '/uploads/books/diwan-ahmed-shawki.jpg',
    type: String,
    nullable: true,
  })
  @Expose()
  coverUrl?: string | null;

  @ApiPropertyOptional({
    description: 'Год публикации книги',
    example: 1927,
    type: Number,
    nullable: true,
  })
  @Expose()
  publicationYear?: number | null;
}

/**
 * DTO для представления автора в ответе API
 *
 * Этот DTO используется для возврата полной информации об авторе,
 * включая его биографию, фотографию и список книг, отсортированных
 * по году публикации (от новых к старым).
 *
 * @example
 * {
 *   "id": 1,
 *   "fullName": "Ахмед Шауки",
 *   "bio": "Выдающийся арабский поэт и драматург, один из величайших поэтов арабского языка",
 *   "photoUrl": "/uploads/authors/ahmed-shawki.jpg",
 *   "books": [
 *     {
 *       "id": 1,
 *       "title": "ديوان أحمد شوقي",
 *       "coverUrl": "/uploads/books/diwan-ahmed-shawki.jpg",
 *       "publicationYear": 1927
 *     }
 *   ]
 * }
 */
export class AuthorResponseDto {
  @ApiProperty({
    description: 'Уникальный идентификатор автора',
    example: 1,
    type: Number,
  })
  @Expose()
  id!: number;

  @ApiProperty({
    description: 'Полное имя автора',
    example: 'Ахмед Шауки',
    type: String,
  })
  @Expose()
  fullName!: string;

  @ApiPropertyOptional({
    description: 'Биография автора',
    example:
      'Выдающийся арабский поэт и драматург, один из величайших поэтов арабского языка',
    type: String,
    nullable: true,
  })
  @Expose()
  bio?: string | null;

  @ApiPropertyOptional({
    description: 'URL фотографии автора',
    example: '/uploads/authors/ahmed-shawki.jpg',
    type: String,
    nullable: true,
  })
  @Expose()
  photoUrl?: string | null;

  @ApiPropertyOptional({
    description:
      'Список книг автора, отсортированных по году публикации (от новых к старым). Присутствует только при получении полной информации об авторе',
    type: [AuthorBookRefDto],
    example: [
      {
        id: 1,
        title: 'ديوان أحمد شوقي',
        coverUrl: '/uploads/books/diwan-ahmed-shawki.jpg',
        publicationYear: 1927,
      },
    ],
  })
  @Expose()
  books?: AuthorBookRefDto[];
}

/**
 * DTO для краткого представления автора в списке
 *
 * Используется для эндпоинта получения списка всех авторов.
 *
 * @example
 * {
 *   "id": 1,
 *   "fullName": "Ахмед Шауки"
 * }
 */
export class AuthorListItemDto {
  @ApiProperty({
    description: 'Уникальный идентификатор автора',
    example: 1,
    type: Number,
  })
  @Expose()
  id!: number;

  @ApiProperty({
    description: 'Полное имя автора',
    example: 'Ахмед Шауки',
    type: String,
  })
  @Expose()
  fullName!: string;
}
