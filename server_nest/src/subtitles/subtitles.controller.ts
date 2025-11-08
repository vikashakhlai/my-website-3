import {
  BadRequestException,
  Controller,
  HttpException,
  HttpStatus,
  Param,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Role } from 'src/auth/roles.enum';
import { GenerateSubtitlesDto } from './dto/generate-subtitles.dto';
import { SubtitlesService } from './subtitles.service';

@ApiTags('Subtitles')
@Controller('subtitles')
export class SubtitlesController {
  constructor(private readonly subtitlesService: SubtitlesService) {}

  @ApiOperation({ summary: 'Сгенерировать субтитры (только авторизованные)' })
  @ApiBearerAuth('access-token')
  @Auth(Role.USER, Role.ADMIN, Role.SUPER_ADMIN) // ✅ Уточните, кто может использовать
  @ApiResponse({
    status: 201,
    description: 'Субтитры успешно созданы',
    type: Object,
  })
  @ApiResponse({ status: 400, description: 'Неверный формат файла или имя' })
  @ApiResponse({ status: 500, description: 'Ошибка сервера при генерации' })
  @ApiParam({ name: 'filename', description: 'Имя видеофайла в папке uploads' })
  @Post(':filename')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async generate(@Param() dto: GenerateSubtitlesDto) {
    try {
      const srtPath = await this.subtitlesService.generateSubtitles(
        dto.filename,
      );

      return {
        success: true,
        message: 'Субтитры успешно созданы',
        path: srtPath,
      };
    } catch (error: unknown) {
      console.error('❌ Ошибка генерации субтитров:', error);

      if (error instanceof BadRequestException) {
        throw error;
      }

      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      throw new HttpException(
        {
          success: false,
          message: 'Ошибка при создании субтитров',
          error: errorMessage,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
