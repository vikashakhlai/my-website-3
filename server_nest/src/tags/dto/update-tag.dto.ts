import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateTagDto {
  @ApiProperty({ example: 'Научная фантастика', description: 'Новое имя тега' })
  @IsString({ message: 'Название тега должно быть строкой' })
  @MinLength(2, { message: 'Название тега должно быть не менее 2 символов' })
  @MaxLength(100, {
    message: 'Название тега не может быть длиннее 100 символов',
  })
  name!: string;
}
