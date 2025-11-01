import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, MinLength } from 'class-validator';

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
}
