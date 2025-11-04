import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { MediaTopicResponseDto } from './media-topic.response.dto';
import { MediaDialectResponseDto } from './media-dialect.response.dto';
import { MediaLevel } from './media-level.enum';

export class MediaResponseDto {
  @ApiProperty({ example: 10 })
  @Expose()
  id!: number;

  @ApiProperty({ example: 'Диалог о подготовке к свадьбе' })
  @Expose()
  title!: string;

  @ApiProperty({ enum: ['video', 'audio', 'text'], example: 'video' })
  @Expose()
  type!: string;

  @ApiProperty({ example: '/uploads/media/1700000000.mp4', nullable: true })
  @Expose()
  mediaUrl!: string | null;

  @ApiProperty({
    example: '/uploads/media/thumbnails/1700000000-preview.jpg',
    nullable: true,
  })
  @Expose()
  previewUrl!: string | null;

  @ApiProperty({ example: '/uploads/subtitles/1700000000.vtt', nullable: true })
  @Expose()
  subtitlesLink!: string | null;

  @ApiProperty({
    example: '/uploads/grammar/files/1700000000.pdf',
    nullable: true,
  })
  @Expose()
  grammarLink!: string | null;

  @ApiProperty({
    enum: MediaLevel,
    example: MediaLevel.BEGINNER,
  })
  @Expose()
  level!: MediaLevel;

  @ApiProperty({
    type: 'object',
    additionalProperties: true,
    example: { pdf: '/file.pdf', glossary: '/glossary.json' },
    nullable: true,
  })
  @Expose()
  resources!: Record<string, any> | null;

  @ApiProperty({ example: '03:24', nullable: true })
  @Expose()
  duration!: string | null;

  @ApiProperty({ example: 'محمد', nullable: true })
  @Expose()
  speaker!: string | null;

  @ApiProperty({ example: 'Эксклюзив Oasis', nullable: true })
  @Expose()
  sourceRole!: string | null;

  @ApiProperty({ example: 'public' })
  @Expose()
  licenseType!: string;

  @ApiProperty({ example: 'Al Jazeera', nullable: true })
  @Expose()
  licenseAuthor!: string | null;

  @ApiProperty({ example: '2024-01-20T18:23:10.000Z' })
  @Expose()
  createdAt!: string;

  @ApiProperty({ example: '2024-02-01T09:55:03.000Z' })
  @Expose()
  updatedAt!: string;

  @ApiProperty({ type: () => MediaTopicResponseDto, isArray: true })
  @Expose()
  @Type(() => MediaTopicResponseDto)
  topics!: MediaTopicResponseDto[];

  @ApiProperty({ type: () => MediaDialectResponseDto, nullable: true })
  @Expose()
  @Type(() => MediaDialectResponseDto)
  dialect!: MediaDialectResponseDto | null;

  @ApiProperty({ example: 3, nullable: true })
  @Expose()
  dialogueGroupId!: number | null;
}
