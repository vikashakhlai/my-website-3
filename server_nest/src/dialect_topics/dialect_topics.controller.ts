import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
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
import { Public } from 'src/auth/decorators/public.decorator';
import { Role } from 'src/auth/roles.enum';
import { mapToDto } from 'src/common/utils/map-to-dto.util';
import { DialectTopicsService } from './dialect_topics.service';
import { CreateDialectTopicDto } from './dto/create-dialect-topic.dto';
import { DialectTopicResponseDto } from './dto/dialect-topic-response.dto';
import { UpdateDialectTopicDto } from './dto/update-dialect-topic.dto';

@ApiTags('Dialect Topics')
@Controller('dialect-topics')
export class DialectTopicsController {
  constructor(private readonly topicsService: DialectTopicsService) {}

  @Public()
  @ApiOperation({ summary: 'Получить все темы диалектов (публично)' })
  @ApiResponse({
    status: 200,
    description: 'Список тем',
    type: [DialectTopicResponseDto],
  })
  @Get()
  async findAll() {
    const topics = await this.topicsService.findAll();
    return topics.map((t) => mapToDto(DialectTopicResponseDto, t));
  }

  @Public()
  @ApiOperation({ summary: 'Получить тему диалекта по ID (публично)' })
  @ApiParam({ name: 'id', example: 1, description: 'ID темы' })
  @ApiResponse({
    status: 200,
    description: 'Информация о теме',
    type: DialectTopicResponseDto,
  })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const topic = await this.topicsService.findOne(id);
    if (!topic) {
      throw new NotFoundException('Тема не найдена');
    }
    return mapToDto(DialectTopicResponseDto, topic);
  }

  @ApiOperation({ summary: 'Создать тему диалекта (SUPER_ADMIN)' })
  @ApiBearerAuth('access-token')
  @Auth(Role.SUPER_ADMIN)
  @ApiResponse({
    status: 201,
    description: 'Тема создана',
    type: DialectTopicResponseDto,
  })
  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async create(@Body() dto: CreateDialectTopicDto) {
    const topic = await this.topicsService.create(dto.name);
    return mapToDto(DialectTopicResponseDto, topic);
  }

  @ApiOperation({ summary: 'Обновить тему диалекта (SUPER_ADMIN)' })
  @ApiBearerAuth('access-token')
  @Auth(Role.SUPER_ADMIN)
  @ApiParam({ name: 'id', example: 1, description: 'ID темы' })
  @ApiResponse({
    status: 200,
    description: 'Тема обновлена',
    type: DialectTopicResponseDto,
  })
  @Put(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDialectTopicDto,
  ) {
    const topic = await this.topicsService.update(id, dto.name!);
    return mapToDto(DialectTopicResponseDto, topic);
  }

  @ApiOperation({ summary: 'Удалить тему диалекта (SUPER_ADMIN)' })
  @ApiBearerAuth('access-token')
  @Auth(Role.SUPER_ADMIN)
  @ApiParam({ name: 'id', example: 1, description: 'ID темы' })
  @ApiResponse({ status: 200, description: 'Тема удалена', type: Object })
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.topicsService.remove(id);
  }
}
