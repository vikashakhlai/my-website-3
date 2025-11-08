import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class SearchBooksDto {
  @ApiPropertyOptional({ example: 1, description: 'Номер страницы' })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'page должно быть целым числом' })
  @Min(1, { message: 'page должно быть не меньше 1' })
  @Transform(({ value }) => (value ? Number(value) : 1))
  page: number = 1;

  @ApiPropertyOptional({ example: 20, description: 'Количество на странице' })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'limit должно быть целым числом' })
  @Min(1, { message: 'limit должно быть не меньше 1' })
  @Max(100, { message: 'limit не может быть больше 100' })
  @Transform(({ value }) => (value ? Number(value) : 20))
  limit: number = 20;

  @ApiPropertyOptional({ example: 'history', description: 'Фильтр по тегу' })
  @IsOptional()
  @IsString({ message: 'tag должно быть строкой' })
  @Transform(({ value }) => value?.trim() || undefined)
  tag?: string;

  @ApiPropertyOptional({ example: 'ibn', description: 'Фильтр по автору' })
  @IsOptional()
  @IsString({ message: 'author должно быть строкой' })
  @Transform(({ value }) => value?.trim() || undefined)
  author?: string;

  @ApiPropertyOptional({ example: 'ислам', description: 'Фильтр по названию' })
  @IsOptional()
  @IsString({ message: 'title должно быть строкой' })
  @Transform(({ value }) => value?.trim() || undefined)
  title?: string;
}
