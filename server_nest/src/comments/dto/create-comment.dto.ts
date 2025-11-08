import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { TargetType } from 'src/common/enums/target-type.enum';

export class CreateCommentDto {
  @ApiProperty({
    enum: TargetType,
    description: 'Тип сущности, к которой привязан комментарий',
    example: TargetType.TEXTBOOK,
  })
  @IsEnum(TargetType, {
    message: `target_type must be one of: ${Object.values(TargetType).join(', ')}`,
  })
  target_type!: TargetType;

  @ApiProperty({
    example: 1,
    description: 'ID сущности',
  })
  @IsInt({ message: 'target_id должно быть целым числом' })
  target_id!: number;

  @ApiProperty({
    example: 'Это отличный учебник!',
    description: 'Текст комментария',
  })
  @IsString({ message: 'content должно быть строкой' })
  @MaxLength(1000, { message: 'content не может быть длиннее 1000 символов' })
  content!: string;

  @ApiPropertyOptional({
    example: 10,
    description: 'ID родительского комментария (для ответа)',
  })
  @IsOptional()
  @IsInt({ message: 'parent_id должно быть целым числом' })
  parent_id?: number | null;
}
