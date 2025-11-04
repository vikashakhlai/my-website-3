import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class MediaTopicResponseDto {
  @ApiProperty({ example: 63 })
  @Expose()
  id!: number;

  @ApiProperty({ example: 'Отношения' })
  @Expose()
  name!: string;
}
