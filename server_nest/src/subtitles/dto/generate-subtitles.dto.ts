import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';

export class GenerateSubtitlesDto {
  @ApiProperty({
    example: 'my-video.mp4',
    description: 'Имя видеофайла (должно быть в папке uploads)',
  })
  @IsString({ message: 'Имя файла должно быть строкой' })
  @Matches(
    /^[a-zA-Z0-9._-]+\.(mp4|avi|mov|mkv|webm|flv|wmv|mpg|mpeg|3gp|3g2|m4v|f4v|f4p|f4a|f4b|ts|mts|vob|ogv|ogm|drc|gif|gifv|mng|avi|mov|qt|wmv|yuv|rm|rmvb|asf|amv|mpg|mp2|mpeg|mpe|mpv|svi|3g2|mp2|mpa|m4a|caf|aac|wav|flac|ogg|wma|aiff|au|raw|pcm|mp3|flac|aac|wma|ogg|opus|webm|weba|3gp|3g2|m4r|spx|opus|wav|mpc|aiff|au|snd|mid|midi|kar|mp3|flac|aac|wma|ogg|opus|webm|weba|3gp|3g2|m4r|spx|opus|wav|mpc|aiff|au|snd|mid|midi|kar|)$/,
    { message: 'Файл должен быть видеоформатом (mp4, avi, mov и т.д.)' },
  )
  filename!: string;
}
