import {
  Controller,
  Post,
  Param,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { SubtitlesService } from './subtitles.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Subtitles')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('subtitles')
export class SubtitlesController {
  constructor(private readonly subtitlesService: SubtitlesService) {}

  @ApiOperation({ summary: 'Сгенерировать субтитры (только авторизованные)' })
  @Post(':filename')
  async generate(@Param('filename') filename: string) {
    try {
      const srtPath = await this.subtitlesService.generateSubtitles(filename);

      return {
        success: true,
        message: 'Субтитры успешно созданы',
        path: srtPath,
      };
    } catch (error) {
      console.error('❌ Ошибка генерации субтитров:', error);

      throw new HttpException(
        {
          success: false,
          message: 'Ошибка при создании субтитров',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
