import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateDialectDto {
  @ApiProperty({
    example: 'Египетский арабский',
    description: 'Название диалекта',
  })
  @IsString({ message: 'name должно быть строкой' })
  @MinLength(2, { message: 'name должно быть не короче 2 символов' })
  @MaxLength(100, { message: 'name не может быть длиннее 100 символов' })
  name!: string;

  @ApiProperty({
    example: 'egyptian',
    description: 'Slug (уникальный идентификатор)',
  })
  @IsString({ message: 'slug должно быть строкой' })
  @MinLength(2, { message: 'slug должно быть не короче 2 символов' })
  @MaxLength(100, { message: 'slug не может быть длиннее 100 символов' })
  slug!: string;

  @ApiProperty({
    example: 'Диалект, распространённый в Египте',
    description: 'Описание диалекта (необязательно)',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'description должно быть строкой' })
  @MaxLength(1000, {
    message: 'description не может быть длиннее 1000 символов',
  })
  description?: string;

  @ApiProperty({
    example: 'Египет',
    description: 'Регион (необязательно)',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'region должно быть строкой' })
  @MaxLength(100, { message: 'region не может быть длиннее 100 символов' })
  region?: string;
}
