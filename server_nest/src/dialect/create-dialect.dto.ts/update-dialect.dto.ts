import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateDialectDto {
  @ApiPropertyOptional({
    example: 'Египетский арабский',
    description: 'Новое название диалекта',
  })
  @IsOptional()
  @IsString({ message: 'name должно быть строкой' })
  @MinLength(2, { message: 'name должно быть не короче 2 символов' })
  @MaxLength(100, { message: 'name не может быть длиннее 100 символов' })
  name?: string;

  @ApiPropertyOptional({
    example: 'egyptian',
    description: 'Новый slug',
  })
  @IsOptional()
  @IsString({ message: 'slug должно быть строкой' })
  @MinLength(2, { message: 'slug должно быть не короче 2 символов' })
  @MaxLength(100, { message: 'slug не может быть длиннее 100 символов' })
  slug?: string;

  @ApiPropertyOptional({
    example: 'Диалект, распространённый в Египте',
    description: 'Новое описание диалекта',
  })
  @IsOptional()
  @IsString({ message: 'description должно быть строкой' })
  @MaxLength(1000, {
    message: 'description не может быть длиннее 1000 символов',
  })
  description?: string;

  @ApiPropertyOptional({
    example: 'Египет',
    description: 'Новый регион',
  })
  @IsOptional()
  @IsString({ message: 'region должно быть строкой' })
  @MaxLength(100, { message: 'region не может быть длиннее 100 символов' })
  region?: string;
}
