import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsInt, Min, IsOptional } from 'class-validator';

/**
 * DTO для создания реплики в диалоге
 *
 * Используется для создания новой реплики (скрипта) для медиа-файла.
 *
 * @example
 * {
 *   "mediaId": 5,
 *   "textOriginal": "مرحبا، كيف حالك؟",
 *   "speakerName": "Ахмед",
 *   "orderIndex": 1
 * }
 */
export class CreateDialogueScriptDto {
  @ApiProperty({
    description: 'Идентификатор медиа-файла, к которому относится реплика',
    example: 5,
    type: Number,
    minimum: 1,
  })
  @IsInt({ message: 'mediaId должен быть целым числом' })
  @Min(1, { message: 'mediaId должен быть положительным числом' })
  mediaId!: number;

  @ApiProperty({
    description: 'Оригинальный текст реплики (на арабском языке)',
    example: 'مرحبا، كيف حالك؟',
    type: String,
  })
  @IsString({ message: 'Текст реплики должен быть строкой' })
  @IsNotEmpty({ message: 'Текст реплики обязателен для заполнения' })
  textOriginal!: string;

  @ApiPropertyOptional({
    description: 'Имя говорящего (если указано)',
    example: 'Ахмед',
    type: String,
    nullable: true,
  })
  @IsOptional()
  @IsString({ message: 'Имя говорящего должно быть строкой' })
  speakerName?: string | null;

  @ApiPropertyOptional({
    description: 'Порядковый номер реплики в диалоге',
    example: 1,
    type: Number,
    minimum: 0,
    nullable: true,
  })
  @IsOptional()
  @IsInt({ message: 'Порядковый номер должен быть целым числом' })
  @Min(0, { message: 'Порядковый номер не может быть отрицательным' })
  orderIndex?: number | null;
}

/**
 * DTO для обновления реплики в диалоге
 *
 * Все поля опциональны. Обновляются только переданные поля.
 */
export class UpdateDialogueScriptDto {
  @ApiPropertyOptional({
    description: 'Оригинальный текст реплики (на арабском языке)',
    example: 'مرحبا، كيف حالك؟',
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'Текст реплики должен быть строкой' })
  textOriginal?: string;

  @ApiPropertyOptional({
    description: 'Имя говорящего',
    example: 'Ахмед',
    type: String,
    nullable: true,
  })
  @IsOptional()
  @IsString({ message: 'Имя говорящего должно быть строкой' })
  speakerName?: string | null;

  @ApiPropertyOptional({
    description: 'Порядковый номер реплики в диалоге',
    example: 1,
    type: Number,
    minimum: 0,
    nullable: true,
  })
  @IsOptional()
  @IsInt({ message: 'Порядковый номер должен быть целым числом' })
  @Min(0, { message: 'Порядковый номер не может быть отрицательным' })
  orderIndex?: number | null;
}

