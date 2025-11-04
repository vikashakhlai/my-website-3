import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class TimestampsDto {
  @ApiProperty({ example: '2024-01-01T10:00:00.000Z' })
  @Expose()
  createdAt!: Date;

  @ApiProperty({ example: '2024-01-01T12:00:00.000Z' })
  @Expose()
  updatedAt!: Date;
}
