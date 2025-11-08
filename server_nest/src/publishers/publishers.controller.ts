import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Put,
  Delete,
  Query,
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
import { PublishersService } from './publishers.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Role } from 'src/auth/roles.enum';
import { Public } from 'src/auth/decorators/public.decorator';
import { CreatePublisherDto, UpdatePublisherDto } from './dto/create-publisher.dto';
import { PublisherResponseDto } from './dto/publisher-response.dto';
import { mapToDto } from 'src/common/utils/map-to-dto.util';
import { ApiErrorResponses } from 'src/common/decorators/api-error-responses.decorator';

@ApiTags('Publishers')
@Controller('publishers')
export class PublishersController {
  constructor(private readonly publishersService: PublishersService) {}

  /** 📋 Список всех издательств (публично) */
  @ApiOperation({
    summary: 'Получить список всех издательств',
    description: 'Возвращает список всех издательств. Публичный доступ.',
  })
  @ApiQuery({
    name: 'includeBooks',
    required: false,
    type: Boolean,
    description: 'Включить список книг издательства',
    example: false,
  })
  @ApiOkResponse({
    description: 'Список издательств успешно получен',
    type: [PublisherResponseDto],
    example: [
      {
        id: 1,
        name: 'دار الشروق',
        books: [
          {
            id: 1,
            title: 'ديوان أحمد شوقي',
            publication_year: 1927,
            cover_url: '/uploads/books/diwan-ahmed-shawki.jpg',
          },
        ],
      },
      {
        id: 2,
        name: 'دار المعارف',
        books: [],
      },
    ],
  })
  @Public()
  @Get()
  async findAll(@Query('includeBooks') includeBooks?: string) {
    const include = includeBooks === 'true';
    const publishers = await this.publishersService.findAll(include);
    return mapToDto(PublisherResponseDto, publishers);
  }

  /** 🔍 Одно издательство (публично) */
  @ApiOperation({
    summary: 'Получить информацию об издательстве',
    description: 'Возвращает информацию об издательстве по его ID. Публичный доступ.',
  })
  @ApiParam({
    name: 'id',
    description: 'Уникальный идентификатор издательства',
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'includeBooks',
    required: false,
    type: Boolean,
    description: 'Включить список книг издательства',
    example: false,
  })
  @ApiOkResponse({
    description: 'Информация об издательстве успешно получена',
    type: PublisherResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Издательство не найдено',
  })
  @Public()
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Query('includeBooks') includeBooks?: string,
  ) {
    const include = includeBooks === 'true';
    const publisher = await this.publishersService.findOne(id, include);
    return mapToDto(PublisherResponseDto, publisher);
  }

  /** ➕ Создать издательство (ADMIN, SUPER_ADMIN) */
  @ApiOperation({
    summary: 'Создать новое издательство',
    description: 'Создает новое издательство в системе. Доступно только для пользователей с ролями ADMIN или SUPER_ADMIN. Требуется JWT токен в заголовке Authorization.',
  })
  @ApiCreatedResponse({
    description: 'Издательство успешно создано',
    type: PublisherResponseDto,
  })
  @ApiErrorResponses({ include404: false })
  @ApiBearerAuth('access-token')
  @ApiSecurity('access-token')
  @Auth(Role.ADMIN, Role.SUPER_ADMIN)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @Post()
  async create(@Body() dto: CreatePublisherDto) {
    const publisher = await this.publishersService.create(dto);
    return mapToDto(PublisherResponseDto, publisher);
  }

  /** ✏️ Обновить издательство (ADMIN, SUPER_ADMIN) */
  @ApiOperation({
    summary: 'Обновить издательство',
    description: 'Обновляет информацию об издательстве. Доступно только для пользователей с ролями ADMIN или SUPER_ADMIN. Требуется JWT токен в заголовке Authorization.',
  })
  @ApiParam({
    name: 'id',
    description: 'Уникальный идентификатор издательства',
    type: Number,
    example: 1,
  })
  @ApiOkResponse({
    description: 'Издательство успешно обновлено',
    type: PublisherResponseDto,
  })
  @ApiErrorResponses()
  @ApiBearerAuth('access-token')
  @ApiSecurity('access-token')
  @Auth(Role.ADMIN, Role.SUPER_ADMIN)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePublisherDto,
  ) {
    const publisher = await this.publishersService.update(id, dto);
    return mapToDto(PublisherResponseDto, publisher);
  }

  /** 🗑 Удалить издательство (ADMIN, SUPER_ADMIN) */
  @ApiOperation({
    summary: 'Удалить издательство',
    description: 'Удаляет издательство из системы. Доступно только для пользователей с ролями ADMIN или SUPER_ADMIN. Требуется JWT токен в заголовке Authorization.',
  })
  @ApiParam({
    name: 'id',
    description: 'Уникальный идентификатор издательства',
    type: Number,
    example: 1,
  })
  @ApiOkResponse({
    description: 'Издательство успешно удалено',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Издательство #1 удалено',
        },
      },
    },
  })
  @ApiErrorResponses({ include400: false })
  @ApiBearerAuth('access-token')
  @ApiSecurity('access-token')
  @Auth(Role.ADMIN, Role.SUPER_ADMIN)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.publishersService.remove(id);
  }
}

