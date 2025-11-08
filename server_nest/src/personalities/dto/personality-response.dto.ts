import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { Era } from '../personality.entity';

/**
 * DTO для цитаты в контексте личности
 */
export class QuoteDto {
  @ApiProperty({
    description: 'Уникальный идентификатор цитаты',
    example: 1,
    type: Number,
  })
  @Expose()
  id!: number;

  @ApiProperty({
    description: 'Текст цитаты на арабском языке',
    example: 'العلم نور والجهل ظلام',
    type: String,
  })
  @Expose()
  text_ar!: string;

  @ApiPropertyOptional({
    description: 'Текст цитаты на русском языке',
    example: 'Знание - это свет, а невежество - тьма',
    type: String,
    nullable: true,
  })
  @Expose()
  text_ru!: string | null;
}

/**
 * DTO для ссылки на книгу в контексте личности
 */
export class BookRefDto {
  @ApiProperty({
    description: 'Уникальный идентификатор книги',
    example: 1,
    type: Number,
  })
  @Expose()
  id!: number;

  @ApiProperty({
    description: 'Название книги',
    example: 'كتاب الموسيقى الكبير',
    type: String,
  })
  @Expose()
  title!: string;

  @ApiPropertyOptional({
    description: 'Описание книги',
    example: 'Великий трактат о музыке, написанный аль-Фараби, содержащий теорию музыки и её влияние на душу человека',
    type: String,
    nullable: true,
  })
  @Expose()
  description!: string | null;

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
 * DTO для ссылки на статью в контексте личности
 */
export class ArticleRefDto {
  @ApiProperty({
    description: 'Уникальный идентификатор статьи',
    example: 1,
    type: Number,
  })
  @Expose()
  id!: number;

  @ApiProperty({
    description: 'Название статьи',
    example: 'Философия аль-Фараби и её влияние на исламскую мысль',
    type: String,
  })
  @Expose()
  title!: string;

  @ApiProperty({
    description: 'Дата создания статьи',
    example: '2024-01-15T10:30:00Z',
    type: String,
  })
  @Expose()
  created_at!: string;
}

/**
 * DTO для ответа с информацией о личности
 */
export class PersonalityResponseDto {
  @ApiProperty({
    description: 'Уникальный идентификатор личности',
    example: 1,
    type: Number,
  })
  @Expose()
  id!: number;

  @ApiProperty({
    description: 'Имя личности',
    example: 'Аль-Фараби',
    type: String,
  })
  @Expose()
  name!: string;

  @ApiPropertyOptional({
    description: 'Годы жизни',
    example: '870-950',
    type: String,
  })
  @Expose()
  years?: string;

  @ApiPropertyOptional({
    description: 'Должность или статус',
    example: 'Философ, математик',
    type: String,
  })
  @Expose()
  position?: string;

  @ApiPropertyOptional({
    description: 'Биография личности',
    example: 'Абу Наср Мухаммад ибн Мухаммад аль-Фараби, известный как аль-Фараби, был выдающимся философом, математиком, музыковедом и ученым эпохи Аббасидов. Родился в Фарабе (современный Казахстан), получил образование в Багдаде. Считается одним из величайших философов исламского мира, известен как "Второй учитель" после Аристотеля.',
    type: String,
  })
  @Expose()
  biography?: string;

  @ApiPropertyOptional({
    description: 'Интересные факты о личности',
    example: [
      'Аль-Фараби написал более 100 работ по философии, логике, музыке и политике',
      'Он был первым, кто систематически изучил и классифицировал науки в исламском мире',
      'Его работы оказали значительное влияние на европейскую философию эпохи Возрождения',
    ],
    type: [String],
  })
  @Expose()
  facts?: string[];

  @ApiPropertyOptional({
    description: 'Историческая эпоха',
    enum: Era,
    example: Era.ABBASID,
  })
  @Expose()
  era?: Era;

  @ApiPropertyOptional({
    description: 'URL изображения личности',
    example: '/uploads/personalities_photoes/al-farabi.webp',
    type: String,
  })
  @Expose()
  imageUrl?: string;

  @ApiPropertyOptional({
    description: 'Список книг, связанных с личностью',
    type: [BookRefDto],
    example: [
      {
        id: 1,
        title: 'كتاب الموسيقى الكبير',
        description: 'Великий трактат о музыке, написанный аль-Фараби',
        publication_year: 950,
        cover_url: '/uploads/books/al-farabi-music.jpg',
      },
    ],
  })
  @Expose()
  @Type(() => BookRefDto)
  books?: BookRefDto[];

  @ApiPropertyOptional({
    description: 'Список статей, связанных с личностью',
    type: [ArticleRefDto],
    example: [
      {
        id: 1,
        title: 'Философия аль-Фараби и её влияние на исламскую мысль',
        created_at: '2024-01-15T10:30:00Z',
      },
    ],
  })
  @Expose()
  @Type(() => ArticleRefDto)
  articles?: ArticleRefDto[];

  @ApiPropertyOptional({
    description: 'Список цитат личности',
    type: [QuoteDto],
    example: [
      {
        id: 1,
        text_ar: 'العلم نور والجهل ظلام',
        text_ru: 'Знание - это свет, а невежество - тьма',
      },
    ],
  })
  @Expose()
  @Type(() => QuoteDto)
  quotes?: QuoteDto[];

  @ApiPropertyOptional({
    description: 'Средний рейтинг личности',
    example: 4.8,
    type: Number,
    nullable: true,
  })
  @Expose()
  averageRating?: number | null;

  @ApiPropertyOptional({
    description: 'Количество оценок',
    example: 122,
    type: Number,
    default: 0,
  })
  @Expose()
  ratingCount?: number;

  @ApiPropertyOptional({
    description: 'Оценка текущего пользователя (если авторизован)',
    example: 5,
    type: Number,
    nullable: true,
  })
  @Expose()
  userRating?: number | null;

  @ApiPropertyOptional({
    description: 'Количество комментариев',
    example: 18,
    type: Number,
    default: 0,
  })
  @Expose()
  commentsCount?: number;

  @ApiPropertyOptional({
    description: 'Является ли личность избранной для текущего пользователя',
    example: false,
    type: Boolean,
    default: false,
  })
  @Expose()
  isFavorite?: boolean;
}
