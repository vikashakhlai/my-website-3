import { IsEnum, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TargetType } from 'src/common/enums/target-type.enum';

/**
 * DTO для создания или обновления рейтинга
 *
 * Используется для создания нового рейтинга или обновления существующего.
 * Если пользователь уже оценил сущность, его рейтинг будет обновлён.
 *
 * @example
 * {
 *   "target_type": "article",
 *   "target_id": 5,
 *   "value": 4
 * }
 */
export class CreateRatingDto {
  @ApiProperty({
    description: 'Тип сущности, которую оценивают',
    enum: TargetType,
    example: TargetType.ARTICLE,
  })
  @IsEnum(TargetType, { message: 'target_type должен быть одним из допустимых значений' })
  target_type!: TargetType;

  @ApiProperty({
    description: 'Идентификатор сущности, которую оценивают',
    example: 5,
    type: Number,
    minimum: 1,
  })
  @IsInt({ message: 'target_id должен быть целым числом' })
  @Min(1, { message: 'target_id должен быть положительным числом' })
  target_id!: number;

  @ApiProperty({
    description: 'Значение рейтинга (от 1 до 5)',
    example: 4,
    type: Number,
    minimum: 1,
    maximum: 5,
  })
  @IsInt({ message: 'value должен быть целым числом' })
  @Min(1, { message: 'Рейтинг не может быть меньше 1' })
  @Max(5, { message: 'Рейтинг не может быть больше 5' })
  value!: number;
}

