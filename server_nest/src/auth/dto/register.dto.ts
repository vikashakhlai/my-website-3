import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email нового пользователя',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'strongPassword123',
    description: 'Пароль нового пользователя (не менее 6 символов)',
  })
  @IsNotEmpty()
  @MinLength(6)
  password!: string;
}
