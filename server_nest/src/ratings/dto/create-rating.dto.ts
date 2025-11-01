import { IsEnum, IsInt, Min, Max } from 'class-validator';
import { TargetType } from 'src/common/enums/target-type.enum';

export class CreateRatingDto {
  @IsEnum(TargetType)
  target_type!: TargetType;

  @IsInt()
  target_id!: number;

  @IsInt()
  @Min(1)
  @Max(5)
  value!: number;
}
