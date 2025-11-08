import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { AuthorResponseDto } from '../../authors/dto/author-response.dto';
import { TagResponseDto } from '../../tags/dto/tag-response.dto';
import { PublisherResponseDto } from '../../publishers/dto/publisher-response.dto';

/**
 * DTO для представления книги в ответе API
 *
 * Этот DTO используется для возврата полной информации о книге,
 * включая связанные сущности (авторы, теги, издательство) и
 * вычисляемые поля (рейтинг, количество оценок, избранное).
 *
 * @example
 * {
 *   "id": 1,
 *   "title": "ديوان أحمد شوقي",
 *   "description": "Сборник стихов выдающегося арабского поэта",
 *   "publicationYear": 1927,
 *   "coverUrl": "/uploads/books/diwan-ahmed-shawki.jpg",
 *   "pages": 450,
 *   "createdAt": "2024-01-15T10:30:00.000Z",
 *   "authors": [
 *     {
 *       "id": 1,
 *       "fullName": "Ахмед Шауки",
 *       "bio": "Выдающийся арабский поэт",
 *       "photoUrl": "/uploads/authors/ahmed-shawki.jpg"
 *     }
 *   ],
 *   "tags": [
 *     {
 *       "id": 5,
 *       "name": "Поэзия"
 *     }
 *   ],
 *   "publisher": {
 *     "id": 3,
 *     "name": "دار الشروق"
 *   },
 *   "averageRating": 4.5,
 *   "ratingCount": 120,
 *   "userRating": 5,
 *   "isFavorite": true
 * }
 */
export class BookResponseDto {
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
    description: 'Описание книги',
    example: 'Сборник стихов выдающегося арабского поэта Ахмеда Шауки',
    type: String,
    nullable: true,
  })
  @Expose()
  description?: string | null;

  @ApiPropertyOptional({
    description: 'Год публикации книги',
    example: 1927,
    type: Number,
    nullable: true,
  })
  @Expose()
  publicationYear?: number | null;

  @ApiPropertyOptional({
    description: 'URL обложки книги',
    example: '/uploads/books/diwan-ahmed-shawki.jpg',
    type: String,
    nullable: true,
  })
  @Expose()
  coverUrl?: string | null;

  @ApiPropertyOptional({
    description: 'Количество страниц в книге',
    example: 450,
    type: Number,
    nullable: true,
  })
  @Expose()
  pages?: number | null;

  @ApiProperty({
    description: 'Дата создания записи в системе',
    example: '2024-01-15T10:30:00.000Z',
    type: Date,
  })
  @Expose()
  createdAt!: Date;

  @ApiProperty({
    description: 'Список авторов книги',
    type: [AuthorResponseDto],
    example: [
      {
        id: 1,
        fullName: 'Ахмед Шауки',
        bio: 'Выдающийся арабский поэт',
        photoUrl: '/uploads/authors/ahmed-shawki.jpg',
      },
    ],
  })
  @Expose()
  authors!: AuthorResponseDto[];

  @ApiProperty({
    description: 'Список тегов, связанных с книгой',
    type: [TagResponseDto],
    example: [
      { id: 5, name: 'Поэзия' },
      { id: 8, name: 'Классическая литература' },
    ],
  })
  @Expose()
  tags!: TagResponseDto[];

  @ApiPropertyOptional({
    description: 'Информация об издательстве',
    type: PublisherResponseDto,
    nullable: true,
    example: {
      id: 3,
      name: 'دار الشروق',
    },
  })
  @Expose()
  publisher?: PublisherResponseDto | null;

  @ApiPropertyOptional({
    description: 'Средний рейтинг книги (от 1 до 5)',
    example: 4.5,
    type: Number,
    nullable: true,
  })
  @Expose()
  averageRating?: number | null;

  @ApiPropertyOptional({
    description: 'Количество оценок, поставленных книге',
    example: 120,
    type: Number,
    default: 0,
  })
  @Expose()
  ratingCount?: number;

  @ApiPropertyOptional({
    description:
      'Оценка текущего пользователя (от 1 до 5). Присутствует только если пользователь авторизован и оценил книгу',
    example: 5,
    type: Number,
    nullable: true,
  })
  @Expose()
  userRating?: number | null;

  @ApiPropertyOptional({
    description:
      'Флаг, указывающий, добавлена ли книга в избранное текущим пользователем. Присутствует только если пользователь авторизован',
    example: true,
    type: Boolean,
    default: false,
  })
  @Expose()
  isFavorite?: boolean;
}
