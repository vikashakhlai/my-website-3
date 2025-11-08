import { IsInt, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO для реакции на комментарий (лайк/дизлайк)
 *
 * @example
 * {
 *   "value": 1
 * }
 */
export class ReactCommentDto {
  @ApiProperty({
    description: 'Значение реакции: 1 = лайк, -1 = дизлайк, 0 = убрать реакцию',
    example: 1,
    enum: [1, -1, 0],
    type: Number,
  })
  @IsInt()
  @IsIn([1, -1, 0], {
    message: 'value must be 1 (like), -1 (dislike), or 0 (remove reaction)',
  })
  value!: 1 | -1 | 0;
}
