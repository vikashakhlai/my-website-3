import {
  Controller,
  Post,
  Param,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Req,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SubtitlesService } from './subtitles.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { GenerateSubtitlesDto } from './dto/generate-subtitles.dto';
import { SubtitleResponseDto } from './dto/subtitle-response.dto';
import { mapToDto } from 'src/common/utils/map-to-dto.util';
import { ApiErrorResponses } from 'src/common/decorators/api-error-responses.decorator';

@ApiTags('Subtitles')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('subtitles')
export class SubtitlesController {
  constructor(private readonly subtitlesService: SubtitlesService) {}

  /**
   * Генерирует субтитры для видео файла
   * Доступно только для авторизованных пользователей
   * Файл должен быть загружен через систему медиа
   */
  @ApiOperation({
    summary: 'Сгенерировать субтитры для видео',
    description:
      'Генерирует субтитры для видео файла. Доступно только для авторизованных пользователей. Файл должен быть загружен через систему медиа. Требуется JWT токен в заголовке Authorization.',
  })
  @ApiParam({
    name: 'filename',
    description: 'Имя файла видео (без пути, только имя файла)',
    example: 'video_1234567890.mp4',
    type: String,
  })
  @ApiOkResponse({
    description: 'Субтитры успешно созданы',
    type: SubtitleResponseDto,
  })
  @ApiErrorResponses({ include403: false })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @Post(':filename')
  async generate(
    @Param('filename') filename: string,
    @Req() req: any,
  ): Promise<SubtitleResponseDto> {
    try {
      const userId = req.user?.sub;
      const srtPath = await this.subtitlesService.generateSubtitles(filename, userId);

      // Преобразуем абсолютный путь в относительный для ответа
      const relativePath = srtPath.replace(process.cwd(), '').replace(/\\/g, '/');

      const result = {
        success: true,
        message: 'Субтитры успешно созданы',
        path: relativePath,
      };

      return mapToDto(SubtitleResponseDto, result);
    } catch (error) {
      // Если это уже HttpException, пробрасываем как есть
      if (error instanceof BadRequestException || error instanceof Error) {
        throw error;
      }

      // Для остальных ошибок создаем BadRequestException
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Ошибка при создании субтитров',
      );
    }
  }
}
