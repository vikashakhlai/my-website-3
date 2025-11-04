import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UuidDto {
  @ApiProperty({ example: 'f9c9c6b4-8d0e-4b3b-a6b3-13a8f32d78b3' })
  @IsUUID('4')
  id!: string;
}
