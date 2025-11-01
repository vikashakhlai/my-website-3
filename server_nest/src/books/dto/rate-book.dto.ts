import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min, Max } from 'class-validator';

export class RateBookDto {
  @ApiProperty({
    example: 4,
    minimum: 1,
    maximum: 5,
    description: 'Оценка книги от 1 до 5',
  })
  @IsInt()
  @Min(1)
  @Max(5)
  value!: number;
}
