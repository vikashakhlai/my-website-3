import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { TargetType } from 'src/common/enums/target-type.enum';

export class CreateCommentDto {
  @IsEnum(TargetType, {
    message: `target_type must be one of: ${Object.values(TargetType).join(', ')}`,
  })
  target_type!: TargetType;

  @IsInt()
  target_id!: number;

  @IsString()
  content!: string;

  @IsOptional()
  @IsInt()
  parent_id?: number | null;
}
