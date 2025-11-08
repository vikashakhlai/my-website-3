import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, Max, Min } from 'class-validator';
import { TargetType } from 'src/common/enums/target-type.enum';

export class CreateRatingDto {
  @ApiProperty({
    enum: TargetType,
    description: 'Тип цели (TEXTBOOK, ARTICLE, etc)',
    example: TargetType.TEXTBOOK,
  })
  @IsEnum(TargetType, { message: 'target_type должен быть допустимым типом' })
  target_type!: TargetType;

  @ApiProperty({
    example: 1,
    description: 'ID цели (например, ID учебника)',
  })
  @IsInt({ message: 'target_id должен быть целым числом' })
  target_id!: number;

  @ApiProperty({
    example: 5,
    minimum: 1,
    maximum: 5,
    description: 'Оценка от 1 до 5',
  })
  @IsInt({ message: 'value должно быть целым числом' })
  @Min(1, { message: 'Оценка должна быть не менее 1' })
  @Max(5, { message: 'Оценка должна быть не более 5' })
  value!: number;
}
