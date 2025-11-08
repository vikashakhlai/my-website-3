import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class SearchDictionaryDto {
  @ApiProperty({
    example: 'كتب',
    description: 'Поисковый запрос (арабский или русский)',
  })
  @IsString({ message: 'query должно быть строкой' })
  @IsNotEmpty({ message: 'query не может быть пустым' })
  @MinLength(1, { message: 'query должно быть не короче 1 символа' })
  @MaxLength(100, { message: 'query не может быть длиннее 100 символов' })
  query!: string;
}
