import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Max, Min } from 'class-validator';

export class RateBookDto {
  @ApiProperty({
    example: 4,
    minimum: 1,
    maximum: 5,
    description: 'Оценка книги от 1 до 5',
  })
  @IsInt({ message: 'value должно быть целым числом' })
  @Min(1, { message: 'value должно быть не меньше 1' })
  @Max(5, { message: 'value не может быть больше 5' })
  value!: number;
}
