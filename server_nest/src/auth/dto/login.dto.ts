import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email пользователя',
  })
  @IsEmail()
  email!: string; // ✅ добавлен "!" для устранения TS2564

  @ApiProperty({
    example: 'strongPassword123',
    description: 'Пароль пользователя',
  })
  @IsNotEmpty()
  @MinLength(6)
  password!: string; // ✅ добавлен "!" для устранения TS2564
}
