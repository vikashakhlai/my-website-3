import { ApiProperty } from '@nestjs/swagger';
import { Era } from '../personality.entity';
import { ArticleRefDto } from './article-ref.dto';
import { BookRefDto } from './book-ref.dto';
import { QuoteDto } from './quote.dto';

export class PersonalityResponseDto {
  @ApiProperty({ example: 1, description: 'ID личности' })
  id!: number;

  @ApiProperty({ example: 'Ибн Сина', description: 'Имя личности' })
  name!: string;

  @ApiProperty({ example: '980 - 1037', description: 'Годы жизни' })
  years!: string;

  @ApiProperty({ example: 'Философ, врач, учёный', description: 'Должность' })
  position!: string;

  @ApiProperty({
    example:
      'Абу Али аль-Хусейн ибн Абдаллах ибн аль-Хасан ибн Али ибн Сины...',
    description: 'Биография',
  })
  biography!: string;

  @ApiProperty({
    type: [String],
    example: ['Известен как Авиценна в Европе', 'Автор "Канона медицины"'],
    description: 'Факты о личности',
  })
  facts!: string[];

  @ApiProperty({ enum: Era, example: Era.ABBASID, description: 'Эпоха' })
  era!: Era;

  @ApiProperty({
    example: '/uploads/personalities_photos/default.webp',
    description: 'URL изображения личности',
  })
  imageUrl!: string;

  @ApiProperty({ type: [BookRefDto], description: 'Связанные книги' })
  books!: BookRefDto[];

  @ApiProperty({ type: [ArticleRefDto], description: 'Связанные статьи' })
  articles!: ArticleRefDto[];

  @ApiProperty({ type: [QuoteDto], description: 'Цитаты личности' })
  quotes!: QuoteDto[];

  @ApiProperty({ example: 4.8, description: 'Средний рейтинг' })
  averageRating!: number | null;

  @ApiProperty({ example: 122, description: 'Количество оценок' })
  ratingCount!: number;

  @ApiProperty({
    example: 5,
    description: 'Оценка текущего пользователя (если авторизован)',
  })
  userRating!: number | null;

  @ApiProperty({ example: 18, description: 'Количество комментариев' })
  commentsCount!: number;

  @ApiProperty({
    example: true,
    description: 'В избранном у текущего пользователя',
  })
  isFavorite!: boolean;

  @ApiProperty({
    example: true,
    description: 'Может ли пользователь поставить оценку',
  })
  canRate!: boolean;

  @ApiProperty({
    example: true,
    description: 'Может ли пользователь оставить комментарий',
  })
  canComment!: boolean;
}
