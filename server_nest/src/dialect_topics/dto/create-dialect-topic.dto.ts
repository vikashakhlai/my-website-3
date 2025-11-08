import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

/**
 * DTO для создания темы диалекта
 *
 * Используется для создания новой темы диалекта. Название должно быть уникальным.
 *
 * @example
 * {
 *   "name": "Приветствие"
 * }
 */
export class CreateDialectTopicDto {
  @ApiProperty({
    description: 'Название темы диалекта. Должно быть уникальным в системе',
    example: 'Приветствие',
    type: String,
    minLength: 2,
    maxLength: 100,
  })
  @IsString({ message: 'Название должно быть строкой' })
  @IsNotEmpty({ message: 'Название обязательно для заполнения' })
  @MinLength(2, { message: 'Название должно содержать минимум 2 символа' })
  @MaxLength(100, { message: 'Название не может превышать 100 символов' })
  name!: string;
}

