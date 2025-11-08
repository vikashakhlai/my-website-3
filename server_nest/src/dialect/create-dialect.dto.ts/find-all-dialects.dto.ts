import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNumberString,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class FindAllDialectsDto {
  @ApiPropertyOptional({
    example: 1,
    description: 'Номер страницы',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumberString({}, { message: 'page должно быть числом' })
  page?: number;

  @ApiPropertyOptional({
    example: 10,
    description: 'Количество на странице',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumberString({}, { message: 'limit должно быть числом' })
  limit?: number;

  @ApiPropertyOptional({
    example: 'Египетский',
    description: 'Фильтр по названию',
  })
  @IsOptional()
  @IsString({ message: 'name должно быть строкой' })
  @MaxLength(100, { message: 'name не может быть длиннее 100 символов' })
  name?: string;

  @ApiPropertyOptional({
    example: 'Египет',
    description: 'Фильтр по региону',
  })
  @IsOptional()
  @IsString({ message: 'region должно быть строкой' })
  @MaxLength(100, { message: 'region не может быть длиннее 100 символов' })
  region?: string;
}
