import { IsEnum, IsInt } from 'class-validator';
import { TargetType } from 'src/common/enums/target-type.enum';

export class RemoveFavoriteDto {
  @IsEnum(TargetType)
  targetType!: TargetType;

  @IsInt()
  targetId!: number;
}
