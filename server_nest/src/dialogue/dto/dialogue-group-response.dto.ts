import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { MediaResponseDto } from 'src/media/dto/media.response.dto';

export class DialogueGroupResponseDto {
  @ApiProperty({ example: 1, description: 'ID группы диалога' })
  @Expose()
  id!: number;

  @ApiProperty({
    example: 'Диалог о покупке в магазине',
    description: 'Название',
  })
  @Expose()
  title!: string;

  @ApiProperty({
    example: 'Обычный разговор между покупателем и продавцом',
    nullable: true,
    description: 'Описание',
  })
  @Expose()
  description!: string | null;

  @ApiProperty({ example: 'fusha', description: 'Базовый язык' })
  @Expose()
  baseLanguage!: string;

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

  @ApiProperty({ type: [MediaResponseDto], description: 'Связанные медиа' })
  @Expose()
  medias!: MediaResponseDto[];
}
