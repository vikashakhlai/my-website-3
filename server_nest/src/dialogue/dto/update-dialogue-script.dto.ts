import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class UpdateDialogueScriptDto {
  @ApiPropertyOptional({
    example: 'مرحبا، كيف يمكنني مساعدتك؟',
    description: 'Новый оригинальный текст реплики',
  })
  @IsOptional()
  @IsString({ message: 'textOriginal должно быть строкой' })
  @MaxLength(10000, {
    message: 'textOriginal не может быть длиннее 10000 символов',
  })
  textOriginal?: string;

  @ApiPropertyOptional({
    example: 'Продавец',
    description: 'Новое имя говорящего (необязательно)',
  })
  @IsOptional()
  @IsString({ message: 'speakerName должно быть строкой' })
  @MaxLength(100, { message: 'speakerName не может быть длиннее 100 символов' })
  speakerName?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Новый порядковый номер реплики (необязательно)',
  })
  @IsOptional()
  @IsInt({ message: 'orderIndex должно быть целым числом' })
  @Min(0, { message: 'orderIndex должно быть неотрицательным' })
  orderIndex?: number;
}
