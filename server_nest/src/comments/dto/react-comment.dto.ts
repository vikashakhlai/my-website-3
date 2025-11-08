import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt } from 'class-validator';

export class ReactCommentDto {
  @ApiProperty({
    example: 1,
    description: 'Значение реакции: 1 (лайк), -1 (дизлайк), 0 (снять)',
    enum: [1, -1, 0],
  })
  @IsInt({ message: 'value должно быть целым числом' })
  @IsIn([1, -1, 0], { message: 'value должно быть 1, -1 или 0' })
  value!: 1 | -1 | 0;
}
