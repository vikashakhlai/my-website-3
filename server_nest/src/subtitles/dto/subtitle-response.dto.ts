import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

/**
 * DTO для ответа после генерации субтитров
 */
export class SubtitleResponseDto {
  @ApiProperty({
    description: 'Успешность операции',
    example: true,
    type: Boolean,
  })
  @Expose()
  success!: boolean;

  @ApiProperty({
    description: 'Сообщение о результате операции',
    example: 'Субтитры успешно созданы',
    type: String,
  })
  @Expose()
  message!: string;

  @ApiProperty({
    description: 'Путь к созданному файлу субтитров',
    example: '/uploads/subtitles/video_1234567890.srt',
    type: String,
  })
  @Expose()
  path!: string;
}

