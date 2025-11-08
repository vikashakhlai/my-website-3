import { IsEnum, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TargetType } from 'src/common/enums/target-type.enum';

/**
 * DTO для удаления элемента из избранного
 *
 * @example
 * {
 *   "targetType": "book",
 *   "targetId": 12
 * }
 */
export class RemoveFavoriteDto {
  @ApiProperty({
    description: 'Тип сущности, которую нужно удалить из избранного',
    enum: TargetType,
    example: TargetType.BOOK,
  })
  @IsEnum(TargetType, {
    message: `targetType must be one of: ${Object.values(TargetType).join(', ')}`,
  })
  targetType!: TargetType;

  @ApiProperty({
    description: 'Идентификатор сущности, которую нужно удалить из избранного',
    example: 12,
    type: Number,
    minimum: 1,
  })
  @IsInt({ message: 'targetId должен быть целым числом' })
  @Min(1, { message: 'targetId должен быть положительным числом' })
  targetId!: number;
}
