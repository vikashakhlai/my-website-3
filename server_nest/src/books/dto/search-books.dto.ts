import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class SearchBooksDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Transform(({ value }) => (value ? Number(value) : 1))
  page: number = 1;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Transform(({ value }) => (value ? Number(value) : 20))
  limit: number = 20;

  @ApiPropertyOptional({ example: 'history' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim() || undefined)
  tag?: string;

  @ApiPropertyOptional({ example: 'ibn' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim() || undefined)
  author?: string;

  @ApiPropertyOptional({ example: 'ислам' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim() || undefined)
  title?: string;
}
