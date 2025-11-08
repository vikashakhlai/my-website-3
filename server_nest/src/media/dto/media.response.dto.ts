import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

import { MediaLevel } from '../enums/media-level.enum';
import { MediaDialectResponseDto } from './media-dialect.response.dto';
import { MediaTopicResponseDto } from './media-topic.response.dto';

export class MediaResponseDto {
  @ApiProperty({ example: 10, description: 'ID медиа' })
  @Expose()
  id!: number;

  @ApiProperty({
    example: 'Диалог о подготовке к свадьбе',
    description: 'Название',
  })
  @Expose()
  title!: string;

  @ApiProperty({
    enum: ['video', 'audio', 'text'],
    example: 'video',
    description: 'Тип медиа',
  })
  @Expose()
  type!: string;

  @ApiProperty({
    example: '/uploads/media/1700000000.mp4',
    nullable: true,
    description: 'Путь к медиа',
  })
  @Expose()
  mediaUrl!: string | null;

  @ApiProperty({
    example: '/uploads/media/thumbnails/1700000000-preview.jpg',
    nullable: true,
    description: 'Путь к превью',
  })
  @Expose()
  previewUrl!: string | null;

  @ApiProperty({
    example: '/uploads/subtitles/1700000000.vtt',
    nullable: true,
    description: 'Путь к субтитрам',
  })
  @Expose()
  subtitlesLink!: string | null;

  @ApiProperty({
    example: '/uploads/grammar/files/1700000000.pdf',
    nullable: true,
    description: 'Путь к грамматике',
  })
  @Expose()
  grammarLink!: string | null;

  @ApiProperty({
    enum: MediaLevel,
    example: MediaLevel.BEGINNER,
    description: 'Уровень сложности',
  })
  @Expose()
  level!: MediaLevel;

  @ApiProperty({
    type: 'object',
    additionalProperties: true,
    example: { pdf: '/file.pdf', glossary: '/glossary.json' },
    nullable: true,
    description: 'Дополнительные ресурсы',
  })
  @Expose()
  resources!: Record<string, any> | null;

  @ApiProperty({
    example: '03:24',
    nullable: true,
    description: 'Длительность',
  })
  @Expose()
  duration!: string | null;

  @ApiProperty({ example: 'محمد', nullable: true, description: 'Говорящий' })
  @Expose()
  speaker!: string | null;

  @ApiProperty({
    example: 'Эксклюзив Oasis',
    nullable: true,
    description: 'Роль источника',
  })
  @Expose()
  sourceRole!: string | null;

  @ApiProperty({ example: 'public', description: 'Тип лицензии' })
  @Expose()
  licenseType!: string;

  @ApiProperty({
    example: 'Al Jazeera',
    nullable: true,
    description: 'Автор лицензии',
  })
  @Expose()
  licenseAuthor!: string | null;

  @ApiProperty({
    example: '2024-01-20T18:23:10.000Z',
    description: 'Дата создания',
  })
  @Expose()
  createdAt!: string;

  @ApiProperty({
    example: '2024-02-01T09:55:03.000Z',
    description: 'Дата обновления',
  })
  @Expose()
  updatedAt!: string;

  @ApiProperty({
    type: () => MediaTopicResponseDto,
    isArray: true,
    description: 'Темы',
  })
  @Expose()
  @Type(() => MediaTopicResponseDto)
  topics!: MediaTopicResponseDto[];

  @ApiProperty({
    type: () => MediaDialectResponseDto,
    nullable: true,
    description: 'Диалект',
  })
  @Expose()
  @Type(() => MediaDialectResponseDto)
  dialect!: MediaDialectResponseDto | null;

  @ApiProperty({
    example: 3,
    nullable: true,
    description: 'ID группы диалогов',
  })
  @Expose()
  dialogueGroupId!: number | null;
}
