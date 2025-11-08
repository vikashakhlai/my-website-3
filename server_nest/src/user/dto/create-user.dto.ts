import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email пользователя',
  })
  @IsEmail({}, { message: 'Некорректный email' })
  @MaxLength(254, { message: 'Email не может быть длиннее 254 символов' })
  @IsNotEmpty({ message: 'Email обязателен' })
  readonly email!: string;

  @ApiProperty({
    example: 'strongPassword123',
    description: 'Пароль пользователя (минимум 6 символов)',
  })
  @IsNotEmpty({ message: 'Пароль обязателен' })
  @MinLength(6, { message: 'Пароль должен быть не менее 6 символов' })
  @MaxLength(128, { message: 'Пароль не может быть длиннее 128 символов' })
  readonly password!: string;
}
