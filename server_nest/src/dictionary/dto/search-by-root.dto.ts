import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class SearchByRootDto {
  @ApiProperty({
    example: 'كتب',
    description: 'Корень слова для поиска',
  })
  @IsString({ message: 'root должно быть строкой' })
  @IsNotEmpty({ message: 'root не может быть пустым' })
  @MinLength(2, { message: 'root должно быть не короче 2 символов' })
  @MaxLength(10, { message: 'root не может быть длиннее 10 символов' })
  root!: string;
}
