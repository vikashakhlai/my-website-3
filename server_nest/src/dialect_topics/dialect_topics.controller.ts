import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  ParseIntPipe,
  UsePipes,
  ValidationPipe,
  NotFoundException,
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
} from '@nestjs/swagger';
import { DialectTopicsService } from './dialect_topics.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Role } from 'src/auth/roles.enum';
import { DialectTopicResponseDto } from './dto/dialect-topic-response.dto';
import { CreateDialectTopicDto } from './dto/create-dialect-topic.dto';
import { mapToDto } from 'src/common/utils/map-to-dto.util';
import { ApiErrorResponses } from 'src/common/decorators/api-error-responses.decorator';

@ApiTags('DialectTopics')
@Controller('dialect-topics')
export class DialectTopicsController {
  constructor(private readonly topicsService: DialectTopicsService) {}

  /** 📜 Получить все топики (только авторизованные) */
  @ApiOperation({
    summary: 'Получить список всех тем диалектов',
    description: 'Возвращает список всех тем диалектов. Требуется авторизация.',
  })
  @ApiOkResponse({
    description: 'Список тем диалектов успешно получен',
    type: [DialectTopicResponseDto],
    example: [
      {
        id: 1,
        name: 'Приветствие',
        medias: [
          {
            id: 5,
            title: 'Видео о приветствиях в египетском диалекте',
          },
        ],
      },
      {
        id: 2,
        name: 'Еда',
        medias: [
          {
            id: 7,
            title: 'Диалог о заказе еды',
          },
        ],
      },
    ],
  })
  @ApiUnauthorizedResponse({
    description: 'Требуется авторизация для доступа к списку тем',
  })
  @Get()
  async findAll() {
    const topics = await this.topicsService.findAll();
    return topics.map((t) => mapToDto(DialectTopicResponseDto, t));
  }

  /** 🔍 Один топик (только авторизованные) */
  @ApiOperation({
    summary: 'Получить тему диалекта по ID',
    description: 'Возвращает полную информацию о теме диалекта, включая связанные медиа-файлы. Требуется авторизация.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Идентификатор темы диалекта',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Тема диалекта успешно получена',
    type: DialectTopicResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Тема диалекта с указанным ID не найдена',
  })
  @ApiUnauthorizedResponse({
    description: 'Требуется авторизация',
  })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const topic = await this.topicsService.findOne(id);
    if (!topic) {
      throw new NotFoundException(`Тема диалекта с ID ${id} не найдена`);
    }
    return mapToDto(DialectTopicResponseDto, topic);
  }

  /** ➕ Создать топик (SUPER_ADMIN) */
  @ApiOperation({
    summary: 'Создать новую тему диалекта (SUPER_ADMIN)',
    description: 'Создаёт новую тему диалекта. Название должно быть уникальным. Требуются права SUPER_ADMIN.',
  })
  @ApiCreatedResponse({
    description: 'Тема диалекта успешно создана',
    type: DialectTopicResponseDto,
  })
  @ApiErrorResponses({ include404: false })
  @Auth(Role.SUPER_ADMIN)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @Post()
  async create(@Body() dto: CreateDialectTopicDto) {
    const topic = await this.topicsService.create(dto.name);
    return mapToDto(DialectTopicResponseDto, topic);
  }
}
