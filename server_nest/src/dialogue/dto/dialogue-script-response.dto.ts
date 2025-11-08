import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { MediaResponseDto } from 'src/media/dto/media.response.dto';

export class DialogueScriptResponseDto {
  @ApiProperty({ example: 1, description: 'ID реплики' })
  @Expose()
  id!: number;

  @ApiProperty({
    example: 'مرحبا، كيف يمكنني مساعدتك؟',
    description: 'Оригинальный текст',
  })
  @Expose()
  textOriginal!: string;

  @ApiProperty({
    example: 'Продавец',
    nullable: true,
    description: 'Имя говорящего',
  })
  @Expose()
  speakerName!: string | null;

  @ApiProperty({ example: 1, nullable: true, description: 'Порядковый номер' })
  @Expose()
  orderIndex!: number | null;

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

  @ApiProperty({ type: MediaResponseDto, description: 'Связанное медиа' })
  @Expose()
  media!: MediaResponseDto;
}
