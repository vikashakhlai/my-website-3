import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  ParseIntPipe,
  Query,
  ValidationPipe,
  UsePipes,
  Sse,
  MessageEvent,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { ReactCommentDto } from './dto/react-comment.dto';
import { CommentResponseDto } from './dto/comment-response.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Role } from 'src/auth/roles.enum';
import { JwtService } from '@nestjs/jwt';
import sanitizeHtml from 'sanitize-html';
import { Throttle } from '@nestjs/throttler';
import { Observable } from 'rxjs';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiSecurity,
  ApiResponse,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { TargetType } from 'src/common/enums/target-type.enum';
import { Public } from 'src/auth/decorators/public.decorator';
import { ApiErrorResponses } from 'src/common/decorators/api-error-responses.decorator';

@ApiTags('Comments')
@Controller('comments')
export class CommentsController {
  constructor(
    private readonly commentsService: CommentsService,
    private readonly jwtService: JwtService,
  ) {}

  // =====================================================
  // 🔥 SSE STREAM (публичный, без авторизации)
  // =====================================================
  @Public()
  @ApiOperation({
    summary: 'Подписка на события комментариев через Server-Sent Events (SSE)',
    description:
      'Публичный эндпоинт для подписки на события комментариев в реальном времени. ' +
      'Возвращает поток событий через SSE. События: created (новый комментарий), ' +
      'react (изменение реакции), deleted (удаление комментария). ' +
      'Не требует аутентификации. Подключение автоматически переподключается при разрыве.',
  })
  @ApiResponse({
    status: 200,
    description: 'SSE поток событий комментариев',
    content: {
      'text/event-stream': {
        schema: {
          type: 'string',
          example: 'data: {"type":"created","comment":{...}}\n\n',
        },
      },
    },
  })
  @Get('stream/:target_type/:target_id')
  @Sse()
  stream(
    @Param('target_type') target_type: TargetType,
    @Param('target_id', ParseIntPipe) target_id: number,
  ): Observable<MessageEvent> {
    return this.commentsService.subscribe(target_type, target_id);
  }

  // =====================================================
  // 📝 Создать комментарий
  // =====================================================
  @ApiOperation({
    summary: 'Создать новый комментарий (универсальный эндпоинт)',
    description:
      'Универсальный эндпоинт для создания комментариев к любой сущности. ' +
      'Создает новый комментарий к указанной сущности. Доступно только для авторизованных пользователей. ' +
      'HTML в содержимом автоматически очищается. Поддерживается вложенность комментариев через parent_id. ' +
      'Ограничение: максимум 5 комментариев в минуту на пользователя. ' +
      'Этот эндпоинт функционально эквивалентен ресурс-специфичным эндпоинтам (например, POST /books/{id}/comments), ' +
      'но позволяет создавать комментарии для любых типов сущностей через единый интерфейс. ' +
      'Для удобства также доступны ресурс-специфичные эндпоинты, которые являются обертками над этим универсальным методом.',
  })
  @ApiBearerAuth('access-token')
  @ApiSecurity('access-token')
  @ApiCreatedResponse({
    description: 'Комментарий успешно создан',
    type: CommentResponseDto,
  })
  @ApiErrorResponses({ include403: false, include404: false })
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async create(@Body() dto: CreateCommentDto, @Request() req: any) {
    dto.content = sanitizeHtml(dto.content, {
      allowedTags: [],
      allowedAttributes: {},
    });

    return this.commentsService.create(dto, req.user);
  }

  // =====================================================
  // 📌 Получить комментарии (через query)
  // =====================================================
  @Public()
  @ApiOperation({
    summary: 'Получить комментарии по query параметрам (универсальный эндпоинт)',
    description:
      'Универсальный эндпоинт для получения комментариев любой сущности через query параметры. ' +
      'Возвращает список комментариев для указанной сущности. Публичный эндпоинт, не требует аутентификации. ' +
      'Если пользователь авторизован (передан JWT токен), дополнительно возвращается информация о его реакциях (my_reaction). ' +
      'Этот эндпоинт функционально эквивалентен ресурс-специфичным эндпоинтам (например, GET /books/{id}/comments), ' +
      'но позволяет работать с комментариями любых типов сущностей через единый интерфейс. ' +
      'Для удобства также доступны ресурс-специфичные эндпоинты, которые являются обертками над этим универсальным методом.',
  })
  @ApiOkResponse({
    description: 'Список комментариев успешно получен',
    type: [CommentResponseDto],
  })
  @ApiQuery({
    name: 'target_type',
    enum: TargetType,
    description: 'Тип сущности (article, book, media, textbook, personality)',
    example: TargetType.ARTICLE,
  })
  @ApiQuery({
    name: 'target_id',
    type: Number,
    description: 'Уникальный идентификатор сущности',
    example: 1,
  })
  @ApiBadRequestResponse({
    description:
      'Неверные параметры запроса. Проверьте target_type и target_id.',
  })
  @Get()
  async getByQuery(
    @Query('target_type') target_type: TargetType,
    @Query('target_id', ParseIntPipe) target_id: number,
    @Request() req: any,
  ) {
    const viewerId = this.tryGetUserId(req);
    return this.commentsService.findByTarget(target_type, target_id, viewerId);
  }

  // =====================================================
  // 📌 Получить комментарии (REST вариант)
  // =====================================================
  @Public()
  @ApiOperation({
    summary: 'Получить комментарии по целевой сущности (REST вариант)',
    description:
      'Универсальный эндпоинт для получения комментариев любой сущности через параметры пути. ' +
      'Возвращает список комментариев для указанной сущности. Публичный эндпоинт, не требует аутентификации. ' +
      'Если пользователь авторизован (передан JWT токен), дополнительно возвращается информация о его реакциях (my_reaction). ' +
      'Этот эндпоинт функционально эквивалентен ресурс-специфичным эндпоинтам (например, GET /books/{id}/comments), ' +
      'но позволяет работать с комментариями любых типов сущностей через единый интерфейс. ' +
      'Для удобства также доступны ресурс-специфичные эндпоинты, которые являются обертками над этим универсальным методом.',
  })
  @ApiParam({
    name: 'target_type',
    enum: TargetType,
    description: 'Тип сущности (article, book, media, textbook, personality)',
    example: TargetType.ARTICLE,
  })
  @ApiParam({
    name: 'target_id',
    description: 'Уникальный идентификатор сущности',
    type: Number,
    example: 1,
  })
  @ApiOkResponse({
    description: 'Список комментариев успешно получен',
    type: [CommentResponseDto],
  })
  @ApiBadRequestResponse({
    description: 'Неверные параметры пути. Проверьте target_type и target_id.',
  })
  @Get(':target_type/:target_id')
  async getComments(
    @Param('target_type') target_type: string,
    @Param('target_id', ParseIntPipe) target_id: number,
    @Request() req: any,
  ) {
    const viewerId = this.tryGetUserId(req);
    return this.commentsService.findByTarget(
      target_type as any,
      target_id,
      viewerId,
    );
  }

  // =====================================================
  // 👍 Лайк / 👎 Дизлайк / ❌ Убрать реакцию
  // =====================================================
  @ApiOperation({
    summary: 'Поставить/снять реакцию на комментарий (лайк/дизлайк)',
    description:
      'Позволяет авторизованному пользователю поставить лайк (1), дизлайк (-1) или убрать реакцию (0) на комментарий. ' +
      'Ограничение: максимум 10 реакций в минуту на пользователя.',
  })
  @ApiBearerAuth('access-token')
  @ApiSecurity('access-token')
  @ApiOkResponse({
    description: 'Реакция успешно обновлена',
    type: CommentResponseDto,
  })
  @ApiBadRequestResponse({
    description:
      'Неверное значение реакции. Должно быть 1 (лайк), -1 (дизлайк) или 0 (убрать реакцию).',
  })
  @ApiUnauthorizedResponse({
    description:
      'Требуется аутентификация. Только авторизованные пользователи могут ставить реакции.',
  })
  @ApiParam({
    name: 'id',
    description: 'Уникальный идентификатор комментария',
    type: Number,
    example: 1,
  })
  @ApiNotFoundResponse({
    description: 'Комментарий с указанным идентификатором не найден',
  })
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post(':id/react')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async react(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ReactCommentDto,
    @Request() req: any,
  ) {
    return this.commentsService.react(id, req.user, dto.value);
  }

  // =====================================================
  // 🗑️ Удалить комментарий (только admin/super_admin)
  // =====================================================
  @ApiOperation({
    summary: 'Удалить комментарий',
    description:
      'Удаляет комментарий из системы. Доступно только для пользователей с ролями ADMIN или SUPER_ADMIN. ' +
      'Требуется JWT токен в заголовке Authorization. Внимание: операция необратима!',
  })
  @ApiBearerAuth('access-token')
  @ApiOkResponse({
    description: 'Комментарий успешно удален',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Комментарий успешно удален',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Требуется аутентификация',
  })
  @ApiForbiddenResponse({
    description:
      'Недостаточно прав. Только ADMIN и SUPER_ADMIN могут удалять комментарии.',
  })
  @ApiParam({
    name: 'id',
    description: 'Уникальный идентификатор комментария',
    type: Number,
    example: 1,
  })
  @ApiNotFoundResponse({
    description: 'Комментарий с указанным идентификатором не найден',
  })
  @Auth(Role.ADMIN, Role.SUPER_ADMIN)
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.commentsService.delete(id, req.user);
  }

  // =====================================================
  // 🔍 helper: достаём userId из Bearer без guard
  // =====================================================
  private tryGetUserId(req: any): string | undefined {
    const auth = req.headers?.authorization;
    if (!auth?.startsWith('Bearer ')) return undefined;
    try {
      const token = auth.split(' ')[1];
      const payload = this.jwtService.verify(token);
      return payload?.sub;
    } catch {
      return undefined;
    }
  }
}
