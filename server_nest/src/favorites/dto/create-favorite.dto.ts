import { IsEnum, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TargetType } from 'src/common/enums/target-type.enum';

/**
 * DTO для добавления элемента в избранное
 *
 * @example
 * {
 *   "targetType": "book",
 *   "targetId": 12
 * }
 */
export class CreateFavoriteDto {
  @ApiProperty({
    description: 'Тип сущности, которую нужно добавить в избранное',
    enum: TargetType,
    example: TargetType.BOOK,
  })
  @IsEnum(TargetType, {
    message: `targetType must be one of: ${Object.values(TargetType).join(', ')}`,
  })
  targetType!: TargetType;

  @ApiProperty({
    description: 'Идентификатор сущности, которую нужно добавить в избранное',
    example: 12,
    type: Number,
    minimum: 1,
  })
  @IsInt({ message: 'targetId должен быть целым числом' })
  @Min(1, { message: 'targetId должен быть положительным числом' })
  targetId!: number;
}
