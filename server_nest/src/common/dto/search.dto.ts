import { IsOptional, IsString, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SearchDto {
  @ApiPropertyOptional({ example: 'arabic grammar' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  q?: string;
}
