import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CreateTagDto {
  @ApiProperty({
    example: 'Поэзия',
    description: 'Название тега',
    type: String,
  })
  @IsString()
  @MinLength(2)
  name!: string;
}
