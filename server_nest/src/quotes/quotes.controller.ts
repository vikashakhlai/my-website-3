import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  ParseIntPipe,
  Param,
  Put,
  Delete,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { QuotesService } from './quotes.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Role } from 'src/auth/roles.enum';
import { Public } from 'src/auth/decorators/public.decorator';
import { QuoteResponseDto } from './dto/quote-response.dto';
import { mapToDto } from 'src/common/utils/map-to-dto.util';
import { ApiErrorResponses } from 'src/common/decorators/api-error-responses.decorator';

@ApiTags('Quotes')
@Controller('quotes')
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  /** 🎲 Случайные цитаты (публично) */
  @ApiOperation({
    summary: 'Получить случайные цитаты',
    description: 'Возвращает случайные цитаты для главной страницы. Публичный доступ.',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Количество цитат',
    example: 2,
  })
  @ApiOkResponse({
    description: 'Случайные цитаты успешно получены',
    type: [QuoteResponseDto],
    example: [
      {
        id: 1,
        text_ar: 'العلم نور والجهل ظلام',
        text_ru: 'Знание - это свет, а невежество - тьма',
        personality: {
          id: 1,
          name: 'Аль-Фараби',
          position: 'Философ, математик',
        },
      },
      {
        id: 2,
        text_ar: 'من طلب العلا سهر الليالي',
        text_ru: 'Кто стремится к высотам, тот не спит ночами',
        personality: {
          id: 2,
          name: 'Ахмед Шауки',
          position: 'Поэт, драматург',
        },
      },
    ],
  })
  @Public()
  @Get('random')
  async getRandomQuotes(@Query('limit') limit?: number) {
    const quotes = await this.quotesService.getRandomMapped(limit ?? 2);
    return mapToDto(QuoteResponseDto, quotes);
  }

  /** 📋 Цитаты по личности (публично) */
  @ApiOperation({
    summary: 'Получить все цитаты по личности',
    description: 'Возвращает все цитаты, связанные с указанной личностью. Публичный доступ.',
  })
  @ApiParam({
    name: 'id',
    description: 'Уникальный идентификатор личности',
    type: Number,
    example: 1,
  })
  @ApiOkResponse({
    description: 'Цитаты успешно получены',
    type: [QuoteResponseDto],
    example: [
      {
        id: 1,
        text_ar: 'العلم نور والجهل ظلام',
        text_ru: 'Знание - это свет, а невежество - тьма',
        personality: {
          id: 1,
          name: 'Аль-Фараби',
          position: 'Философ, математик',
        },
      },
      {
        id: 3,
        text_ar: 'من طلب العلا سهر الليالي',
        text_ru: 'Кто стремится к высотам, тот не спит ночами',
        personality: {
          id: 1,
          name: 'Аль-Фараби',
          position: 'Философ, математик',
        },
      },
    ],
  })
  @Public()
  @Get('by-personality/:id')
  async getByPersonality(@Param('id', ParseIntPipe) id: number) {
    const quotes = await this.quotesService.findByPersonality(id);
    return mapToDto(QuoteResponseDto, quotes);
  }

  /** 📋 Список всех цитат (публично) */
  @ApiOperation({
    summary: 'Получить список всех цитат',
    description: 'Возвращает список всех цитат в системе. Публичный доступ.',
  })
  @ApiOkResponse({
    description: 'Список цитат успешно получен',
    type: [QuoteResponseDto],
  })
  @Public()
  @Get()
  async getAll() {
    const quotes = await this.quotesService.findAll();
    return mapToDto(QuoteResponseDto, quotes);
  }

  /** ➕ Создать цитату (ADMIN, SUPER_ADMIN) */
  @ApiOperation({
    summary: 'Создать новую цитату',
    description: 'Создает новую цитату в системе. Доступно только для пользователей с ролями ADMIN или SUPER_ADMIN. Требуется JWT токен в заголовке Authorization.',
  })
  @ApiCreatedResponse({
    description: 'Цитата успешно создана',
    type: QuoteResponseDto,
  })
  @ApiErrorResponses({ include404: false })
  @ApiBearerAuth('access-token')
  @Auth(Role.ADMIN, Role.SUPER_ADMIN)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @Post()
  async create(@Body() dto: CreateQuoteDto) {
    const quote = await this.quotesService.create(dto);
    return mapToDto(QuoteResponseDto, quote);
  }

  /** ✏️ Обновить цитату (ADMIN, SUPER_ADMIN) */
  @ApiOperation({
    summary: 'Обновить цитату',
    description: 'Обновляет информацию о цитате. Доступно только для пользователей с ролями ADMIN или SUPER_ADMIN. Требуется JWT токен в заголовке Authorization.',
  })
  @ApiParam({
    name: 'id',
    description: 'Уникальный идентификатор цитаты',
    type: Number,
    example: 1,
  })
  @ApiOkResponse({
    description: 'Цитата успешно обновлена',
    type: QuoteResponseDto,
  })
  @ApiErrorResponses()
  @ApiBearerAuth('access-token')
  @Auth(Role.ADMIN, Role.SUPER_ADMIN)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateQuoteDto,
  ) {
    const quote = await this.quotesService.update(id, dto);
    return mapToDto(QuoteResponseDto, quote);
  }

  /** 🗑 Удалить цитату (ADMIN, SUPER_ADMIN) */
  @ApiOperation({
    summary: 'Удалить цитату',
    description: 'Удаляет цитату из системы. Доступно только для пользователей с ролями ADMIN или SUPER_ADMIN. Требуется JWT токен в заголовке Authorization.',
  })
  @ApiParam({
    name: 'id',
    description: 'Уникальный идентификатор цитаты',
    type: Number,
    example: 1,
  })
  @ApiOkResponse({
    description: 'Цитата успешно удалена',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Цитата #1 удалена',
        },
      },
    },
  })
  @ApiErrorResponses({ include400: false })
  @ApiBearerAuth('access-token')
  @Auth(Role.ADMIN, Role.SUPER_ADMIN)
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.quotesService.delete(id);
  }
}
