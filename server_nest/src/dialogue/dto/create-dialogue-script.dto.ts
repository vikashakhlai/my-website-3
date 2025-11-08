import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateDialogueScriptDto {
  @ApiProperty({
    example: 'مرحبا، كيف يمكنني مساعدتك؟',
    description: 'Оригинальный текст реплики',
  })
  @IsString({ message: 'textOriginal должно быть строкой' })
  @MaxLength(10000, {
    message: 'textOriginal не может быть длиннее 10000 символов',
  })
  textOriginal!: string;

  @ApiProperty({
    example: 'Продавец',
    description: 'Имя говорящего (необязательно)',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'speakerName должно быть строкой' })
  @MaxLength(100, { message: 'speakerName не может быть длиннее 100 символов' })
  speakerName?: string;

  @ApiProperty({
    example: 1,
    description: 'Порядковый номер реплики (необязательно)',
    required: false,
  })
  @IsOptional()
  @IsInt({ message: 'orderIndex должно быть целым числом' })
  @Min(0, { message: 'orderIndex должно быть неотрицательным' })
  orderIndex?: number;
}
