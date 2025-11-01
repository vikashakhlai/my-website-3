import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class UpdateTagDto {
  @ApiProperty({ example: 'Научная фантастика', description: 'Новое имя тега' })
  @IsString()
  @MinLength(2)
  name!: string;
}
