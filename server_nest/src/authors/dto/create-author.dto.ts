import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateAuthorDto {
  @ApiProperty({
    example: 'Ибн Сина',
    description: 'Полное имя автора',
  })
  @IsString({ message: 'fullName должно быть строкой' })
  @MaxLength(200, { message: 'fullName не может быть длиннее 200 символов' })
  fullName!: string;

  @ApiPropertyOptional({
    example: 'Персидский философ и врач...',
    description: 'Биография автора',
  })
  @IsOptional()
  @IsString({ message: 'bio должно быть строкой' })
  @MaxLength(10000, { message: 'bio не может быть длиннее 10000 символов' })
  bio?: string;

  @ApiPropertyOptional({
    example: '/uploads/authors/ibn_sina.jpg',
    description: 'Ссылка на фото автора',
  })
  @IsOptional()
  @IsString({ message: 'photoUrl должно быть строкой' })
  @MaxLength(500, { message: 'photoUrl не может быть длиннее 500 символов' })
  photoUrl?: string;
}
