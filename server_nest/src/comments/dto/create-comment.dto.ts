import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TargetType } from 'src/common/enums/target-type.enum';

/**
 * DTO для создания комментария
 *
 * Комментарии могут быть созданы только авторизованными пользователями.
 * Комментарии поддерживают вложенность через parent_id.
 *
 * @example
 * {
 *   "target_type": "article",
 *   "target_id": 5,
 *   "content": "Отличная статья! Очень полезная информация.",
 *   "parent_id": null
 * }
 */
export class CreateCommentDto {
  @ApiProperty({
    description: 'Тип сущности, к которой привязан комментарий',
    enum: TargetType,
    example: TargetType.ARTICLE,
  })
  @IsEnum(TargetType, {
    message: `target_type must be one of: ${Object.values(TargetType).join(', ')}`,
  })
  target_type!: TargetType;

  @ApiProperty({
    description: 'Идентификатор сущности, к которой привязан комментарий',
    example: 5,
    type: Number,
  })
  @IsInt()
  target_id!: number;

  @ApiProperty({
    description:
      'Текст комментария. Минимум 1 символ, максимум 5000 символов. HTML будет автоматически очищен',
    example: 'Отличная статья! Очень полезная информация.',
    type: String,
    minLength: 1,
    maxLength: 5000,
  })
  @IsString()
  @MinLength(1, { message: 'Комментарий не может быть пустым' })
  @MaxLength(5000, { message: 'Комментарий не может превышать 5000 символов' })
  content!: string;

  @ApiPropertyOptional({
    description:
      'Идентификатор родительского комментария (если это ответ на другой комментарий)',
    example: null,
    type: Number,
    nullable: true,
  })
  @IsOptional()
  @IsInt()
  parent_id?: number | null;
}
