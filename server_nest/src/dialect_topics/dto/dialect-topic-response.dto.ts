import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class DialectTopicResponseDto {
  @ApiProperty({ example: 1, description: 'ID темы' })
  @Expose()
  id!: number;

  @ApiProperty({ example: 'Отношения', description: 'Название темы' })
  @Expose()
  name!: string;

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
}
