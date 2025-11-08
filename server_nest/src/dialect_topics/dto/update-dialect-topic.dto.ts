import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateDialectTopicDto {
  @ApiPropertyOptional({
    example: 'Семья',
    description: 'Новое название темы диалекта',
  })
  @IsOptional()
  @IsString({ message: 'name должно быть строкой' })
  @MinLength(2, { message: 'name должно быть не короче 2 символов' })
  @MaxLength(100, { message: 'name не может быть длиннее 100 символов' })
  name?: string;
}
