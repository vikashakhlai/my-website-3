import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateDialogueGroupDto {
  @ApiProperty({
    example: 'Диалог о покупке в магазине',
    description: 'Название группы диалога',
  })
  @IsString({ message: 'title должно быть строкой' })
  @MaxLength(200, { message: 'title не может быть длиннее 200 символов' })
  title!: string;

  @ApiProperty({
    example: 'Обычный разговор между покупателем и продавцом',
    description: 'Описание группы диалога',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'description должно быть строкой' })
  @MaxLength(1000, {
    message: 'description не может быть длиннее 1000 символов',
  })
  description?: string;

  @ApiProperty({
    example: 'fusha',
    description: 'Базовый язык (fusha, dialect)',
    default: 'fusha',
  })
  @IsOptional()
  @IsString({ message: 'baseLanguage должно быть строкой' })
  @IsIn(['fusha', 'dialect'], {
    message: 'baseLanguage должно быть fusha или dialect',
  })
  baseLanguage?: string;
}
