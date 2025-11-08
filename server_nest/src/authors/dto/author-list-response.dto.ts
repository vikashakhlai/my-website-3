import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class AuthorListResponseDto {
  @ApiProperty({ example: 1, description: 'ID автора' })
  @Expose()
  id!: number;

  @ApiProperty({ example: 'Ибн Сина', description: 'Полное имя' })
  @Expose()
  full_name!: string;
}
