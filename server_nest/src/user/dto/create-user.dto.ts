import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsOptional,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { UserRole, AccessLevel } from '../user.entity';

export class CreateUserDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email пользователя',
  })
  @IsEmail()
  readonly email!: string; // ✅ добавлен "!" — гарантирует инициализацию

  @ApiProperty({
    example: 'strongPassword123',
    description: 'Пароль пользователя (минимум 6 символов)',
  })
  @IsNotEmpty()
  @MinLength(6)
  readonly password!: string; // ✅ добавлен "!" — исправляет TS2564

  @ApiProperty({
    example: UserRole.USER,
    enum: UserRole,
    required: false,
    description: 'Роль пользователя (по умолчанию USER)',
  })
  @IsOptional()
  @IsEnum(UserRole)
  readonly role?: UserRole;

  @ApiProperty({
    example: false,
    description: 'Флаг — является ли пользователь автором',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  readonly isAuthor?: boolean;

  @ApiProperty({
    example: AccessLevel.BASIC,
    enum: AccessLevel,
    required: false,
    description: 'Уровень доступа пользователя (BASIC / ADVANCED / PREMIUM)',
  })
  @IsOptional()
  @IsEnum(AccessLevel)
  readonly accessLevel?: AccessLevel;
}
