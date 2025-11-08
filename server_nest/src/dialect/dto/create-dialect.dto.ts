import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, MaxLength, IsOptional } from 'class-validator';

/**
 * DTO для создания диалекта
 *
 * Используется для создания нового диалекта. Все поля, кроме description и region, обязательны.
 *
 * @example
 * {
 *   "name": "Египетский диалект",
 *   "slug": "egyptian",
 *   "description": "Диалект, распространённый в Египте",
 *   "region": "Египет"
 * }
 */
export class CreateDialectDto {
  @ApiProperty({
    description: 'Название диалекта. Должно быть уникальным',
    example: 'Египетский диалект',
    type: String,
    minLength: 2,
    maxLength: 100,
  })
  @IsString({ message: 'Название должно быть строкой' })
  @IsNotEmpty({ message: 'Название обязательно для заполнения' })
  @MinLength(2, { message: 'Название должно содержать минимум 2 символа' })
  @MaxLength(100, { message: 'Название не может превышать 100 символов' })
  name!: string;

  @ApiProperty({
    description: 'URL-дружественный идентификатор диалекта. Должен быть уникальным и содержать только латинские буквы, цифры и дефисы',
    example: 'egyptian',
    type: String,
    minLength: 2,
    maxLength: 100,
  })
  @IsString({ message: 'Slug должен быть строкой' })
  @IsNotEmpty({ message: 'Slug обязателен для заполнения' })
  @MinLength(2, { message: 'Slug должен содержать минимум 2 символа' })
  @MaxLength(100, { message: 'Slug не может превышать 100 символов' })
  slug!: string;

  @ApiPropertyOptional({
    description: 'Описание диалекта',
    example: 'Диалект, распространённый в Египте и других странах региона',
    type: String,
    nullable: true,
  })
  @IsOptional()
  @IsString({ message: 'Описание должно быть строкой' })
  description?: string | null;

  @ApiPropertyOptional({
    description: 'Регион, где распространён диалект',
    example: 'Египет',
    type: String,
    maxLength: 100,
    nullable: true,
  })
  @IsOptional()
  @IsString({ message: 'Регион должен быть строкой' })
  @MaxLength(100, { message: 'Регион не может превышать 100 символов' })
  region?: string | null;
}

/**
 * DTO для обновления диалекта
 *
 * Все поля опциональны. Обновляются только переданные поля.
 */
export class UpdateDialectDto {
  @ApiPropertyOptional({
    description: 'Название диалекта',
    example: 'Египетский диалект',
    type: String,
    minLength: 2,
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'Название должно быть строкой' })
  @MinLength(2, { message: 'Название должно содержать минимум 2 символа' })
  @MaxLength(100, { message: 'Название не может превышать 100 символов' })
  name?: string;

  @ApiPropertyOptional({
    description: 'URL-дружественный идентификатор диалекта',
    example: 'egyptian',
    type: String,
    minLength: 2,
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'Slug должен быть строкой' })
  @MinLength(2, { message: 'Slug должен содержать минимум 2 символа' })
  @MaxLength(100, { message: 'Slug не может превышать 100 символов' })
  slug?: string;

  @ApiPropertyOptional({
    description: 'Описание диалекта',
    example: 'Диалект, распространённый в Египте',
    type: String,
    nullable: true,
  })
  @IsOptional()
  @IsString({ message: 'Описание должно быть строкой' })
  description?: string | null;

  @ApiPropertyOptional({
    description: 'Регион, где распространён диалект',
    example: 'Египет',
    type: String,
    maxLength: 100,
    nullable: true,
  })
  @IsOptional()
  @IsString({ message: 'Регион должен быть строкой' })
  @MaxLength(100, { message: 'Регион не может превышать 100 символов' })
  region?: string | null;
}

