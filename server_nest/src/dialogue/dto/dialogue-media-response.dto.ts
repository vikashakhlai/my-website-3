import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { DialogueScriptResponseDto } from './dialogue-script-response.dto';

/**
 * DTO для представления медиа в контексте диалога
 */
export class DialogueMediaResponseDto {
  @ApiProperty({
    description: 'Идентификатор медиа',
    example: 1,
    type: Number,
  })
  @Expose()
  id!: number;

  @ApiProperty({
    description: 'Название медиа',
    example: 'Диалог в ресторане',
    type: String,
  })
  @Expose()
  title!: string;

  @ApiPropertyOptional({
    description: 'Диалект, к которому относится медиа',
    type: Object,
    nullable: true,
    example: {
      id: 3,
      name: 'Египетский диалект',
    },
  })
  @Expose()
  dialect?: {
    id: number;
    name: string;
  } | null;

  @ApiPropertyOptional({
    description: 'Список реплик (скриптов) для этого медиа',
    type: [DialogueScriptResponseDto],
    example: [
      {
        id: 1,
        textOriginal: 'مرحبا، كيف حالك؟',
        speakerName: 'Официант',
        orderIndex: 1,
        createdAt: '2024-01-15T10:30:00.000Z',
        updatedAt: '2024-01-15T10:30:00.000Z',
      },
    ],
  })
  @Expose()
  @Type(() => DialogueScriptResponseDto)
  scripts?: DialogueScriptResponseDto[];
}

