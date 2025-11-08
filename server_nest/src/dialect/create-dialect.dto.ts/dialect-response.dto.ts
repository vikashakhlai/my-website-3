import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { MediaResponseDto } from 'src/media/dto/media.response.dto'; // ✅ Убедитесь, что путь правильный

export class DialectResponseDto {
  @ApiProperty({ example: 1, description: 'ID диалекта' })
  @Expose()
  id!: number;

  @ApiProperty({ example: 'Египетский арабский', description: 'Название' })
  @Expose()
  name!: string;

  @ApiProperty({ example: 'egyptian', description: 'Slug' })
  @Expose()
  slug!: string;

  @ApiProperty({
    example: 'Диалект, распространённый в Египте',
    nullable: true,
    description: 'Описание',
  })
  @Expose()
  description!: string | null;

  @ApiProperty({ example: 'Египет', nullable: true, description: 'Регион' })
  @Expose()
  region!: string | null;

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
