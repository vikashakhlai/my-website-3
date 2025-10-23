import {
  Controller,
  Post,
  Param,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { SubtitlesService } from './subtitles.service';

@Controller('subtitles')
export class SubtitlesController {
  constructor(private readonly subtitlesService: SubtitlesService) {}

  @Post(':filename')
  async generate(@Param('filename') filename: string) {
    try {
      const srtPath = await this.subtitlesService.generateSubtitles(filename);
      return { success: true, path: srtPath };
    } catch (error) {
      console.error(error);
      throw new HttpException(
        'Ошибка при создании субтитров',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
