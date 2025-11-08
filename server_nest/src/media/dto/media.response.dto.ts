import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { MediaTopicResponseDto } from './media-topic.response.dto';
import { MediaDialectResponseDto } from './media-dialect.response.dto';
import { MediaLevel } from './media-level.enum';
import { ExerciseResponseDto } from '../../common/exercises/dto/exercise-response.dto';

/**
 * DTO для представления медиа-контента в ответе API
 * 
 * Этот DTO используется для возврата информации о медиа-контенте (видео, аудио, текст),
 * включая связанные темы, диалект, упражнения и метаданные.
 * 
 * @example
 * {
 *   "id": 10,
 *   "title": "Диалог о подготовке к свадьбе",
 *   "type": "video",
 *   "mediaUrl": "/uploads/media/1700000000.mp4",
 *   "previewUrl": "/uploads/media/thumbnails/1700000000-preview.jpg",
 *   "subtitlesLink": "/uploads/subtitles/1700000000.vtt",
 *   "grammarLink": "/uploads/grammar/files/1700000000.pdf",
 *   "level": "beginner",
 *   "resources": { "pdf": "/file.pdf", "glossary": "/glossary.json" },
 *   "duration": "03:24",
 *   "speaker": "محمد",
 *   "sourceRole": "Эксклюзив Oasis",
 *   "licenseType": "public",
 *   "licenseAuthor": "Al Jazeera",
 *   "createdAt": "2024-01-20T18:23:10.000Z",
 *   "updatedAt": "2024-02-01T09:55:03.000Z",
 *   "topics": [...],
 *   "dialect": {...},
 *   "dialogueGroupId": 3,
 *   "exercises": [...]
 * }
 */
export class MediaResponseDto {
  @ApiProperty({
    description: 'Уникальный идентификатор медиа-контента',
    example: 10,
    type: Number,
  })
  @Expose()
  id!: number;

  @ApiProperty({
    description: 'Название медиа-контента',
    example: 'Диалог о подготовке к свадьбе',
    type: String,
  })
  @Expose()
  title!: string;

  @ApiProperty({
    description: 'Тип медиа-контента',
    enum: ['video', 'audio', 'text'],
    example: 'video',
  })
  @Expose()
  type!: string;

  @ApiProperty({
    description: 'URL основного медиа-файла (видео или аудио)',
    example: '/uploads/media/1700000000.mp4',
    type: String,
    nullable: true,
  })
  @Expose()
  mediaUrl!: string | null;

  @ApiProperty({
    description: 'URL превью-изображения (миниатюра)',
    example: '/uploads/media/thumbnails/1700000000-preview.jpg',
    type: String,
    nullable: true,
  })
  @Expose()
  previewUrl!: string | null;

  @ApiProperty({
    description: 'URL файла субтитров в формате VTT',
    example: '/uploads/subtitles/1700000000.vtt',
    type: String,
    nullable: true,
  })
  @Expose()
  subtitlesLink!: string | null;

  @ApiProperty({
    description: 'URL файла с грамматическими материалами (обычно PDF)',
    example: '/uploads/grammar/files/1700000000.pdf',
    type: String,
    nullable: true,
  })
  @Expose()
  grammarLink!: string | null;

  @ApiProperty({
    description: 'Уровень сложности медиа-контента',
    enum: MediaLevel,
    example: MediaLevel.BEGINNER,
  })
  @Expose()
  level!: MediaLevel;

  @ApiProperty({
    description: 'Дополнительные ресурсы (PDF, глоссарии и т.д.) в формате объекта',
    type: 'object',
    additionalProperties: true,
    example: { pdf: '/file.pdf', glossary: '/glossary.json' },
    nullable: true,
  })
  @Expose()
  resources!: Record<string, any> | null;

  @ApiProperty({
    description: 'Длительность медиа-контента в формате MM:SS или HH:MM:SS',
    example: '03:24',
    type: String,
    nullable: true,
  })
  @Expose()
  duration!: string | null;

  @ApiProperty({
    description: 'Имя говорящего или участника диалога',
    example: 'محمد',
    type: String,
    nullable: true,
  })
  @Expose()
  speaker!: string | null;

  @ApiProperty({
    description: 'Роль или источник контента (для подписи "предоставлено", "создано")',
    example: 'Эксклюзив Oasis',
    type: String,
    nullable: true,
  })
  @Expose()
  sourceRole!: string | null;

  @ApiProperty({
    description: 'Тип лицензии контента',
    example: 'public',
    type: String,
  })
  @Expose()
  licenseType!: string;

  @ApiProperty({
    description: 'Автор или источник лицензии',
    example: 'Al Jazeera',
    type: String,
    nullable: true,
  })
  @Expose()
  licenseAuthor!: string | null;

  @ApiProperty({
    description: 'Дата создания записи в системе',
    example: '2024-01-20T18:23:10.000Z',
    type: String,
  })
  @Expose()
  createdAt!: string;

  @ApiProperty({
    description: 'Дата последнего обновления записи',
    example: '2024-02-01T09:55:03.000Z',
    type: String,
  })
  @Expose()
  updatedAt!: string;

  @ApiProperty({
    description: 'Список тем, связанных с медиа-контентом',
    type: [MediaTopicResponseDto],
    example: [
      {
        id: 2,
        name: 'Приветствие',
      },
      {
        id: 7,
        name: 'Еда',
      },
    ],
  })
  @Expose()
  @Type(() => MediaTopicResponseDto)
  topics!: MediaTopicResponseDto[];

  @ApiProperty({
    description: 'Диалект, используемый в медиа-контенте (если это не фусха)',
    type: MediaDialectResponseDto,
    nullable: true,
    example: {
      id: 3,
      name: 'Египетский арабский',
      region: 'Египет',
      slug: 'egyptian',
    },
  })
  @Expose()
  @Type(() => MediaDialectResponseDto)
  dialect!: MediaDialectResponseDto | null;

  @ApiProperty({
    description: 'Идентификатор группы диалогов (для связывания фусха и диалектов)',
    example: 3,
    type: Number,
    nullable: true,
  })
  @Expose()
  dialogueGroupId!: number | null;

  @ApiPropertyOptional({
    description: 'Список упражнений, связанных с медиа-контентом',
    type: [ExerciseResponseDto],
    example: [
      {
        id: 1,
        type: 'fill_in_the_blanks',
        instructionRu: 'Заполните пропуски правильными словами',
        instructionAr: 'املأ الفراغات بالكلمات الصحيحة',
        articleId: null,
        mediaId: 10,
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
  @Type(() => ExerciseResponseDto)
  exercises?: ExerciseResponseDto[];
}
