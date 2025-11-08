import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Matches, MaxLength } from 'class-validator';

/**
 * DTO для генерации субтитров
 */
export class GenerateSubtitlesDto {
  @ApiProperty({
    description: 'Имя файла видео (без пути, только имя файла)',
    example: 'video_1234567890.mp4',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @Matches(/^[a-zA-Z0-9_\-\.]+$/, {
    message: 'Имя файла может содержать только буквы, цифры, подчеркивания, дефисы и точки',
  })
  filename!: string;
}

