import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  MinLength,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { UserRole, AccessLevel } from '../user.entity';

export class UpdateUserDto {
  @ApiPropertyOptional({
    example: 'newemail@example.com',
    description: 'Новый email пользователя',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    example: 'newStrongPassword123',
    description: 'Новый пароль пользователя (минимум 6 символов)',
  })
  @IsOptional()
  @MinLength(6)
  password?: string;

  @ApiPropertyOptional({
    example: UserRole.ADMIN,
    enum: UserRole,
    description: 'Изменение роли пользователя (только SUPER_ADMIN)',
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({
    example: true,
    description: 'Обновить статус автора (ADMIN или SUPER_ADMIN)',
  })
  @IsOptional()
  @IsBoolean()
  isAuthor?: boolean;

  @ApiPropertyOptional({
    example: AccessLevel.ADVANCED,
    enum: AccessLevel,
    description: 'Изменение уровня доступа пользователя к курсам',
  })
  @IsOptional()
  @IsEnum(AccessLevel)
  accessLevel?: AccessLevel;
}
