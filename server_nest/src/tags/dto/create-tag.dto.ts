import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CreateTagDto {
  @ApiProperty({ example: 'Фантастика', description: 'Название тега' })
  @IsString()
  @MinLength(2)
  name!: string;
}
