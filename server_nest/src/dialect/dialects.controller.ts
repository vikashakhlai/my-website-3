import {
  Controller,
  Get,
  Query,
  Param,
  Post,
  Body,
  Put,
  Delete,
  ParseIntPipe,
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
  ApiSecurity,
} from '@nestjs/swagger';
import { DialectsService } from './dialects.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Role } from 'src/auth/roles.enum';
import { DialectResponseDto } from './dto/dialect-response.dto';
import { CreateDialectDto, UpdateDialectDto } from './dto/create-dialect.dto';
import { DialectQueryDto } from './dto/dialect-query.dto';
import { Dialect } from './dialect.entity';
import { mapToDto } from 'src/common/utils/map-to-dto.util';
import { ApiErrorResponses } from 'src/common/decorators/api-error-responses.decorator';

@ApiTags('Dialects')
@Controller('dialects')
export class DialectsController {
  constructor(private readonly dialectsService: DialectsService) {}

  /** 📜 Получить все диалекты (только авторизованные) */
  @ApiOperation({
    summary: 'Получить список диалектов с фильтрацией и пагинацией',
    description:
      'Возвращает список диалектов с возможностью фильтрации по названию и региону. ' +
      'Требуется авторизация. Поддерживает пагинацию.',
  })
  @ApiBearerAuth('access-token')
  @ApiSecurity('access-token')
  @ApiOkResponse({
    description: 'Список диалектов успешно получен',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/DialectResponseDto' },
          example: [
            {
              id: 1,
              name: 'Египетский диалект',
              slug: 'egyptian',
              description: 'Диалект, распространённый в Египте и других странах региона',
              region: 'Египет',
              createdAt: '2024-01-15T10:30:00.000Z',
              updatedAt: '2024-01-15T10:30:00.000Z',
              medias: [
                {
                  id: 5,
                  title: 'Диалог о подготовке к свадьбе (египетский диалект)',
                },
              ],
            },
          ],
        },
        total: { type: 'number', example: 50 },
        totalPages: { type: 'number', example: 5 },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Требуется авторизация для доступа к списку диалектов',
  })
  @Get()
  async findAll(@Query() query: DialectQueryDto) {
    const result = await this.dialectsService.findAll({
      page: query.page,
      limit: query.limit,
      name: query.name,
      region: query.region,
    });
    return {
      ...result,
      data: result.data.map((d) => mapToDto(DialectResponseDto, d)),
    };
  }

  /** 🔍 Один диалект (только авторизованные) */
  @ApiOperation({
    summary: 'Получить диалект по ID',
    description: 'Возвращает полную информацию о диалекте, включая связанные медиа-файлы. Требуется авторизация.',
  })
  @ApiBearerAuth('access-token')
  @ApiSecurity('access-token')
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Идентификатор диалекта',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Диалект успешно получен',
    type: DialectResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Диалект с указанным ID не найден',
  })
  @ApiUnauthorizedResponse({
    description: 'Требуется авторизация',
  })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const dialect = await this.dialectsService.findOne(id);
    return mapToDto(DialectResponseDto, dialect);
  }

  /** 📍 Получить список регионов (только авторизованные) */
  @ApiOperation({
    summary: 'Получить список всех уникальных регионов',
    description: 'Возвращает отсортированный список всех регионов, где распространены диалекты. Требуется авторизация.',
  })
  @ApiBearerAuth('access-token')
  @ApiSecurity('access-token')
  @ApiOkResponse({
    description: 'Список регионов успешно получен',
    schema: {
      type: 'array',
      items: { type: 'string' },
      example: ['Египет', 'Сирия', 'Ливан', 'Марокко'],
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Требуется авторизация',
  })
  @Get('regions')
  getRegions() {
    return this.dialectsService.getRegions();
  }

  /** ➕ Создать (SUPER_ADMIN) */
  @ApiOperation({
    summary: 'Создать новый диалект (SUPER_ADMIN)',
    description: 'Создаёт новый диалект. Требуются права SUPER_ADMIN.',
  })
  @ApiCreatedResponse({
    description: 'Диалект успешно создан',
    type: DialectResponseDto,
  })
  @ApiErrorResponses({ include404: false })
  @Auth(Role.SUPER_ADMIN)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @Post()
  async create(@Body() dto: CreateDialectDto) {
    // Преобразуем null в undefined для совместимости с Partial<Dialect>
    const data = {
      ...dto,
      description: dto.description ?? undefined,
      region: dto.region ?? undefined,
    };
    const dialect = await this.dialectsService.create(data);
    return mapToDto(DialectResponseDto, dialect);
  }

  /** ♻️ Обновить (SUPER_ADMIN) */
  @ApiOperation({
    summary: 'Обновить диалект (SUPER_ADMIN)',
    description: 'Обновляет информацию о диалекте. Требуются права SUPER_ADMIN.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Идентификатор диалекта',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Диалект успешно обновлён',
    type: DialectResponseDto,
  })
  @ApiErrorResponses()
  @Auth(Role.SUPER_ADMIN)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDialectDto,
  ) {
    // Преобразуем null в undefined для совместимости с Partial<Dialect>
    const data: Partial<Dialect> = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.slug !== undefined) data.slug = dto.slug;
    if (dto.description !== undefined) {
      data.description = (dto.description === null ? undefined : dto.description) as string | undefined;
    }
    if (dto.region !== undefined) {
      data.region = (dto.region === null ? undefined : dto.region) as string | undefined;
    }
    const dialect = await this.dialectsService.update(id, data);
    return mapToDto(DialectResponseDto, dialect);
  }

  /** 🗑 Удалить (SUPER_ADMIN) */
  @ApiOperation({
    summary: 'Удалить диалект (SUPER_ADMIN)',
    description: 'Удаляет диалект из системы. Требуются права SUPER_ADMIN.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Идентификатор диалекта',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Диалект успешно удалён',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Диалект успешно удалён' },
      },
    },
  })
  @ApiErrorResponses({ include400: false })
  @Auth(Role.SUPER_ADMIN)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.dialectsService.remove(id);
    return { message: 'Диалект успешно удалён' };
  }
}
