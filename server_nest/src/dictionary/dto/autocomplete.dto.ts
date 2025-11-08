import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class AutocompleteDto {
  @ApiProperty({
    example: 'كت',
    description: 'Часть слова для автодополнения',
  })
  @IsString({ message: 'q должно быть строкой' })
  @MinLength(2, { message: 'q должно быть не короче 2 символов' })
  @MaxLength(100, { message: 'q не может быть длиннее 100 символов' })
  q!: string;
}
