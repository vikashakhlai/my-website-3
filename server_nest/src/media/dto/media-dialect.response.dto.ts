import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class MediaDialectResponseDto {
  @ApiProperty({ example: 3 })
  @Expose()
  id!: number;

  @ApiProperty({ example: 'Египетский арабский' })
  @Expose()
  name!: string;

  @ApiProperty({ example: 'Egypt' })
  @Expose()
  region!: string;

  @ApiProperty({ example: 'egyptian' })
  @Expose()
  slug!: string;
}
