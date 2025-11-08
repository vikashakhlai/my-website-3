import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, MaxLength, MinLength } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({
    example: 'newemail@example.com',
    description: 'Новый email пользователя',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Некорректный email' })
  @MaxLength(254, { message: 'Email не может быть длиннее 254 символов' })
  email?: string;

  @ApiPropertyOptional({
    example: 'newStrongPassword123',
    description: 'Новый пароль пользователя (минимум 6 символов)',
  })
  @IsOptional()
  @MinLength(6, { message: 'Пароль должен быть не менее 6 символов' })
  @MaxLength(128, { message: 'Пароль не может быть длиннее 128 символов' })
  password?: string;
}
