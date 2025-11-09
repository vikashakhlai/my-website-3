// src/user/dto/change-password.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    example: 'oldPassword123',
    description: 'Текущий пароль пользователя',
  })
  @IsString()
  oldPassword!: string;

  @ApiProperty({
    example: 'newStrongPassword456',
    description: 'Новый пароль (минимум 8 символов)',
  })
  @IsString()
  @MinLength(8)
  newPassword!: string;

  @ApiProperty({
    example: 'newStrongPassword456',
    description: 'Подтверждение нового пароля (должно совпадать)',
  })
  @IsString()
  @MinLength(8)
  confirmPassword!: string;
}

