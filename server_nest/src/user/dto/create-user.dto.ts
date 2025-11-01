import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email пользователя',
  })
  @IsEmail()
  readonly email!: string;

  @ApiProperty({
    example: 'strongPassword123',
    description: 'Пароль пользователя (минимум 6 символов)',
  })
  @IsNotEmpty()
  @MinLength(6)
  readonly password!: string;
}
