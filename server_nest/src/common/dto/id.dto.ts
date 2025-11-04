import { IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class IdDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  id!: number;
}
