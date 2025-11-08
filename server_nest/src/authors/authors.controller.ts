import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Body,
  Put,
  Delete,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { AuthorsService } from './authors.service';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import {
  AuthorResponseDto,
  AuthorListItemDto,
} from './dto/author-response.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Role } from 'src/auth/roles.enum';
import { Public } from 'src/auth/decorators/public.decorator';

@ApiTags('Authors')
@Controller('authors')
export class AuthorsController {
  constructor(private readonly authorsService: AuthorsService) {}

  // ==================== Публичный ====================

  @Public()
  @ApiOperation({
    summary: 'Получить автора с его книгами',
    description:
      'Возвращает полную информацию об авторе, включая биографию, фотографию и список всех его книг, отсортированных по году публикации (от новых к старым). Публичный эндпоинт, не требует аутентификации.',
  })
  @ApiOkResponse({
    description: 'Информация об авторе успешно получена',
    type: AuthorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Автор с указанным идентификатором не найден',
  })
  @ApiBadRequestResponse({
    description: 'Некорректный формат идентификатора автора',
  })
  @Get(':id')
  async getAuthor(@Param('id', ParseIntPipe) id: number) {
    return this.authorsService.getAuthorById(id);
  }

  @Public()
  @ApiOperation({
    summary: 'Получить список всех авторов',
    description:
      'Возвращает список всех авторов в системе, отсортированный по имени в алфавитном порядке. Публичный эндпоинт, не требует аутентификации.',
  })
  @ApiOkResponse({
    description: 'Список авторов успешно получен',
    type: [AuthorListItemDto],
  })
  @Get()
  async getAllAuthors() {
    return this.authorsService.getAllAuthors();
  }

  // ==================== ADMIN+ ====================

  @ApiOperation({
    summary: 'Создать нового автора',
    description:
      'Создает нового автора в системе. Доступно только для пользователей с ролями ADMIN или SUPER_ADMIN. Требуется JWT токен в заголовке Authorization.',
  })
  @ApiCreatedResponse({
    description: 'Автор успешно создан',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Автор создан',
        },
        id: {
          type: 'number',
          example: 1,
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description:
      'Неверные данные запроса. Проверьте обязательные поля (fullName должен быть не менее 3 символов) и формат URL для photoUrl.',
  })
  @Auth(Role.ADMIN, Role.SUPER_ADMIN)
  @Post()
  async create(@Body() dto: CreateAuthorDto) {
    return this.authorsService.createAuthor(dto);
  }

  @ApiOperation({
    summary: 'Обновить данные автора',
    description:
      'Обновляет информацию об авторе по его идентификатору. Доступно только для пользователей с ролями ADMIN или SUPER_ADMIN. Требуется JWT токен в заголовке Authorization.',
  })
  @ApiOkResponse({
    description: 'Автор успешно обновлен',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Автор обновлен',
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Автор с указанным идентификатором не найден',
  })
  @ApiBadRequestResponse({
    description:
      'Неверные данные запроса. Проверьте типы данных и значения полей.',
  })
  @Auth(Role.ADMIN, Role.SUPER_ADMIN)
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAuthorDto,
  ) {
    return this.authorsService.updateAuthor(id, dto);
  }

  @ApiOperation({
    summary: 'Удалить автора',
    description:
      'Удаляет автора из системы по его идентификатору. Доступно только для пользователей с ролями ADMIN или SUPER_ADMIN. Требуется JWT токен в заголовке Authorization. Внимание: операция необратима!',
  })
  @ApiOkResponse({
    description: 'Автор успешно удален',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Автор удален',
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Автор с указанным идентификатором не найден',
  })
  @Auth(Role.ADMIN, Role.SUPER_ADMIN)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.authorsService.deleteAuthor(id);
  }
}
