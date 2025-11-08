import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Param,
  Put,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiTags,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { TagResponseDto } from './dto/tag-response.dto';
import { Public } from 'src/auth/decorators/public.decorator';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Role } from 'src/auth/roles.enum';

@ApiTags('Tags')
@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  // === 📌 Публично: получить список тегов ===
  @Public()
  @ApiOperation({
    summary: 'Получить все теги',
    description:
      'Возвращает список всех тегов в системе, отсортированных по названию в алфавитном порядке. Публичный эндпоинт, не требует аутентификации.',
  })
  @ApiOkResponse({
    description: 'Список тегов успешно получен',
    type: [TagResponseDto],
  })
  @Get()
  async getAll() {
    return this.tagsService.findAll();
  }

  // === ➕ Создать тег (ADMIN+) ===
  @ApiOperation({
    summary: 'Создать новый тег',
    description:
      'Создает новый тег в системе. Название тега должно быть уникальным. Доступно только для пользователей с ролями ADMIN или SUPER_ADMIN. Требуется JWT токен в заголовке Authorization.',
  })
  @ApiCreatedResponse({
    description: 'Тег успешно создан',
    type: TagResponseDto,
  })
  @ApiBadRequestResponse({
    description:
      'Неверные данные запроса или тег с таким названием уже существует. Название тега должно быть не менее 2 символов.',
  })
  @Auth(Role.ADMIN, Role.SUPER_ADMIN)
  @Post()
  async create(@Body() dto: CreateTagDto) {
    return this.tagsService.create(dto);
  }

  // === ✏️ Обновить тег (ADMIN+) ===
  @ApiOperation({
    summary: 'Обновить существующий тег',
    description:
      'Обновляет информацию о теге по его идентификатору. Название тега должно быть уникальным. Доступно только для пользователей с ролями ADMIN или SUPER_ADMIN. Требуется JWT токен в заголовке Authorization.',
  })
  @ApiOkResponse({
    description: 'Тег успешно обновлен',
    type: TagResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Тег с указанным идентификатором не найден',
  })
  @ApiBadRequestResponse({
    description:
      'Неверные данные запроса или другое тег с таким названием уже существует.',
  })
  @Auth(Role.ADMIN, Role.SUPER_ADMIN)
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTagDto,
  ) {
    return this.tagsService.update(id, dto);
  }

  // === ❌ Удалить тег (ADMIN+) ===
  @ApiOperation({
    summary: 'Удалить тег',
    description:
      'Удаляет тег из системы по его идентификатору. Доступно только для пользователей с ролями ADMIN или SUPER_ADMIN. Требуется JWT токен в заголовке Authorization. Внимание: операция необратима!',
  })
  @ApiOkResponse({
    description: 'Тег успешно удален',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Tag deleted',
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Тег с указанным идентификатором не найден',
  })
  @Auth(Role.ADMIN, Role.SUPER_ADMIN)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.tagsService.remove(id);
  }
}
