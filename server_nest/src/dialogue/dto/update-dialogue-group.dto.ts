import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateDialogueGroupDto {
  @ApiPropertyOptional({
    example: 'Диалог о покупке в магазине',
    description: 'Новое название группы диалога',
  })
  @IsOptional()
  @IsString({ message: 'title должно быть строкой' })
  @MaxLength(200, { message: 'title не может быть длиннее 200 символов' })
  title?: string;

  @ApiPropertyOptional({
    example: 'Обычный разговор между покупателем и продавцом',
    description: 'Новое описание группы диалога',
  })
  @IsOptional()
  @IsString({ message: 'description должно быть строкой' })
  @MaxLength(1000, {
    message: 'description не может быть длиннее 1000 символов',
  })
  description?: string;

  @ApiPropertyOptional({
    example: 'dialect',
    description: 'Новый базовый язык (fusha, dialect)',
  })
  @IsOptional()
  @IsString({ message: 'baseLanguage должно быть строкой' })
  @IsIn(['fusha', 'dialect'], {
    message: 'baseLanguage должно быть fusha или dialect',
  })
  baseLanguage?: string;
}
