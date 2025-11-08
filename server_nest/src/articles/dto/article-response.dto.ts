import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { ExerciseResponseDto } from '../../common/exercises/dto/exercise-response.dto';

/**
 * DTO для представления темы статьи в ответе API
 *
 * @example
 * {
 *   "id": 1,
 *   "nameRu": "Грамматика",
 *   "nameAr": "قواعد",
 *   "slug": "grammar"
 * }
 */
export class ArticleThemeResponseDto {
  @ApiProperty({
    description: 'Уникальный идентификатор темы',
    example: 1,
    type: Number,
  })
  @Expose()
  id!: number;

  @ApiProperty({
    description: 'Название темы на русском языке',
    example: 'Грамматика',
    type: String,
  })
  @Expose()
  nameRu!: string;

  @ApiProperty({
    description: 'Название темы на арабском языке',
    example: 'قواعد',
    type: String,
  })
  @Expose()
  nameAr!: string;

  @ApiProperty({
    description: 'URL-дружественный идентификатор темы',
    example: 'grammar',
    type: String,
  })
  @Expose()
  slug!: string;
}

/**
 * DTO для представления статьи в ответе API
 *
 * Этот DTO используется для возврата полной информации о статье,
 * включая связанные упражнения, тему, рейтинги и комментарии.
 *
 * @example
 * {
 *   "id": 1,
 *   "titleRu": "Основы арабской грамматики",
 *   "titleAr": "أساسيات قواعد اللغة العربية",
 *   "description": "Введение в основы арабской грамматики",
 *   "content": "<p>Содержание статьи...</p>",
 *   "imageUrl": "/uploads/articles/grammar-basics.jpg",
 *   "videoUrl": null,
 *   "createdAt": "2024-01-15T10:30:00.000Z",
 *   "theme": {
 *     "id": 1,
 *     "nameRu": "Грамматика",
 *     "nameAr": "قواعد",
 *     "slug": "grammar"
 *   },
 *   "themeRu": "Грамматика",
 *   "exercises": [
 *     {
 *       "id": 1,
 *       "type": "fill_in_the_blanks",
 *       "instructionRu": "Заполните пропуски",
 *       "instructionAr": "املأ الفراغات",
 *       "items": [...]
 *     }
 *   ],
 *   "averageRating": 4.5,
 *   "ratingCount": 120,
 *   "userRating": 5,
 *   "commentCount": 18
 * }
 */
export class ArticleResponseDto {
  @ApiProperty({
    description: 'Уникальный идентификатор статьи',
    example: 1,
    type: Number,
  })
  @Expose()
  id!: number;

  @ApiProperty({
    description: 'Название статьи на русском языке',
    example: 'Основы арабской грамматики',
    type: String,
  })
  @Expose()
  titleRu!: string;

  @ApiProperty({
    description: 'Название статьи на арабском языке',
    example: 'أساسيات قواعد اللغة العربية',
    type: String,
  })
  @Expose()
  titleAr!: string;

  @ApiPropertyOptional({
    description: 'Краткое описание статьи',
    example: 'Введение в основы арабской грамматики для начинающих',
    type: String,
    nullable: true,
  })
  @Expose()
  description?: string | null;

  @ApiPropertyOptional({
    description: 'Полное содержание статьи в формате HTML',
    example: '<p>Содержание статьи...</p>',
    type: String,
    nullable: true,
  })
  @Expose()
  content?: string | null;

  @ApiPropertyOptional({
    description: 'URL изображения статьи',
    example: '/uploads/articles/grammar-basics.jpg',
    type: String,
    nullable: true,
  })
  @Expose()
  imageUrl?: string | null;

  @ApiPropertyOptional({
    description: 'URL видео, связанного со статьей',
    example: null,
    type: String,
    nullable: true,
  })
  @Expose()
  videoUrl?: string | null;

  @ApiProperty({
    description: 'Дата создания статьи',
    example: '2024-01-15T10:30:00.000Z',
    type: Date,
  })
  @Expose()
  createdAt!: Date;

  @ApiPropertyOptional({
    description: 'Тема статьи',
    type: ArticleThemeResponseDto,
    nullable: true,
  })
  @Expose()
  theme?: ArticleThemeResponseDto | null;

  @ApiPropertyOptional({
    description: 'Название темы на русском языке (для обратной совместимости)',
    example: 'Грамматика',
    type: String,
    nullable: true,
  })
  @Expose()
  themeRu?: string | null;

  @ApiProperty({
    description: 'Список упражнений, связанных со статьей',
    type: [ExerciseResponseDto],
    example: [
      {
        id: 1,
        type: 'fill_in_the_blanks',
        instructionRu: 'Заполните пропуски правильными словами',
        instructionAr: 'املأ الفراغات بالكلمات الصحيحة',
        articleId: 1,
        mediaId: null,
        distractorPoolId: null,
        items: [
          {
            id: 1,
            position: 0,
            partBefore: 'Я хочу ',
            partAfter: ' в магазин',
            correctAnswer: 'пойти',
            options: ['пойти', 'идти', 'ехать'],
          },
        ],
      },
    ],
  })
  @Expose()
  exercises!: ExerciseResponseDto[];

  @ApiPropertyOptional({
    description: 'Средний рейтинг статьи (от 1 до 5)',
    example: 4.5,
    type: Number,
    nullable: true,
  })
  @Expose()
  averageRating?: number | null;

  @ApiPropertyOptional({
    description: 'Количество оценок, поставленных статье',
    example: 120,
    type: Number,
    default: 0,
  })
  @Expose()
  ratingCount?: number;

  @ApiPropertyOptional({
    description:
      'Оценка текущего пользователя (от 1 до 5). Присутствует только если пользователь авторизован и оценил статью',
    example: 5,
    type: Number,
    nullable: true,
  })
  @Expose()
  userRating?: number | null;

  @ApiPropertyOptional({
    description: 'Количество комментариев к статье',
    example: 18,
    type: Number,
    default: 0,
  })
  @Expose()
  commentCount?: number;
}
