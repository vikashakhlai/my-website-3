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
  BadRequestException,
  ValidationPipe,
  UsePipes,
  Sse,
  MessageEvent,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';
import sanitizeHtml from 'sanitize-html';
import { Throttle } from '@nestjs/throttler';
import { Observable } from 'rxjs';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { TargetType } from 'src/common/enums/target-type.enum';
import { Public } from 'src/auth/decorators/public.decorator';

class ReactDto {
  value!: 1 | -1 | 0;
}

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
  @ApiBearerAuth('access-token')
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
  @ApiOperation({ summary: 'Получить комментарии по query (публично)' })
  @ApiResponse({ status: 200, description: 'Список комментариев' })
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
  @ApiOperation({
    summary: 'Получить комментарии по целевой сущности (публично)',
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
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Поставить/снять реакцию (like/dislike)' })
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiBody({
    schema: { properties: { value: { type: 'integer', enum: [1, -1, 0] } } },
  })
  @Post(':id/react')
  async react(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: ReactDto,
    @Request() req: any,
  ) {
    console.log('BACKEND BODY:', body);
    console.log('BACKEND TYPEOF:', typeof body.value);
    const raw = Number(body.value);
    if (![1, -1, 0].includes(raw)) {
      throw new BadRequestException('value must be 1, -1 or 0');
    }
    const value = raw as 1 | -1 | 0;
    return this.commentsService.react(id, req.user, value);
  }

  // =====================================================
  // 🗑️ Удалить комментарий (только автор или admin/super_admin)
  // =====================================================
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Удалить комментарий (автор или ADMIN/SUPER_ADMIN)',
  })
  @UseGuards(JwtAuthGuard)
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
