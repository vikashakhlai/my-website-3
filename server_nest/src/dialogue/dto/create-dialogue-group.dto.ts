import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, MaxLength, IsOptional } from 'class-validator';

/**
 * DTO для создания группы диалогов
 *
 * Используется для создания новой группы диалогов. Все поля, кроме description, обязательны.
 *
 * @example
 * {
 *   "title": "Диалог в ресторане",
 *   "description": "Разговор о заказе еды в ресторане",
 *   "baseLanguage": "fusha"
 * }
 */
export class CreateDialogueGroupDto {
  @ApiProperty({
    description: 'Название группы диалогов',
    example: 'Диалог в ресторане',
    type: String,
    minLength: 2,
    maxLength: 200,
  })
  @IsString({ message: 'Название должно быть строкой' })
  @IsNotEmpty({ message: 'Название обязательно для заполнения' })
  @MinLength(2, { message: 'Название должно содержать минимум 2 символа' })
  @MaxLength(200, { message: 'Название не может превышать 200 символов' })
  title!: string;

  @ApiPropertyOptional({
    description: 'Описание группы диалогов',
    example: 'Разговор о заказе еды в ресторане',
    type: String,
    nullable: true,
  })
  @IsOptional()
  @IsString({ message: 'Описание должно быть строкой' })
  description?: string | null;

  @ApiProperty({
    description: 'Базовый язык диалога (обычно "fusha" - фусха)',
    example: 'fusha',
    type: String,
    default: 'fusha',
  })
  @IsString({ message: 'Базовый язык должен быть строкой' })
  @IsNotEmpty({ message: 'Базовый язык обязателен для заполнения' })
  baseLanguage!: string;
}

/**
 * DTO для обновления группы диалогов
 *
 * Все поля опциональны. Обновляются только переданные поля.
 */
export class UpdateDialogueGroupDto {
  @ApiPropertyOptional({
    description: 'Название группы диалогов',
    example: 'Диалог в ресторане',
    type: String,
    minLength: 2,
    maxLength: 200,
  })
  @IsOptional()
  @IsString({ message: 'Название должно быть строкой' })
  @MinLength(2, { message: 'Название должно содержать минимум 2 символа' })
  @MaxLength(200, { message: 'Название не может превышать 200 символов' })
  title?: string;

  @ApiPropertyOptional({
    description: 'Описание группы диалогов',
    example: 'Разговор о заказе еды в ресторане',
    type: String,
    nullable: true,
  })
  @IsOptional()
  @IsString({ message: 'Описание должно быть строкой' })
  description?: string | null;

  @ApiPropertyOptional({
    description: 'Базовый язык диалога',
    example: 'fusha',
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'Базовый язык должен быть строкой' })
  baseLanguage?: string;
}

