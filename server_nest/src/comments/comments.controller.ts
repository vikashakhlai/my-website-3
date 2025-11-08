import {
  Body,
  Controller,
  Delete,
  Get,
  MessageEvent,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Request,
  Sse,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Observable } from 'rxjs';
import sanitizeHtml from 'sanitize-html';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Public } from 'src/auth/decorators/public.decorator';
import { TargetType } from 'src/common/enums/target-type.enum';
import { mapToDto } from 'src/common/utils/map-to-dto.util';
import { CommentsService } from './comments.service';
import { CommentResponseDto } from './dto/comment-response.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { ReactCommentDto } from './dto/react-comment.dto';

@ApiTags('Comments')
@Controller('comments')
export class CommentsController {
  constructor(
    private readonly commentsService: CommentsService,
    private readonly jwtService: JwtService,
  ) {}

  @Public()
  @ApiOperation({ summary: 'SSE: стрим обновлений комментариев (публично)' })
  @ApiParam({
    name: 'target_type',
    enum: TargetType,
    description: 'Тип сущности',
  })
  @ApiParam({ name: 'target_id', example: 1, description: 'ID сущности' })
  @Get('stream/:target_type/:target_id')
  @Sse()
  stream(
    @Param('target_type') target_type: TargetType,
    @Param('target_id', ParseIntPipe) target_id: number,
  ): Observable<MessageEvent> {
    return this.commentsService.subscribe(target_type, target_id);
  }

  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Создать комментарий (авторизованные пользователи)',
  })
  @ApiResponse({
    status: 201,
    description: 'Комментарий создан',
    type: CommentResponseDto,
  })
  @Auth()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async create(@Body() dto: CreateCommentDto, @Request() req: any) {
    dto.content = sanitizeHtml(dto.content, {
      allowedTags: [],
      allowedAttributes: {},
    });

    const comment = await this.commentsService.create(dto, req.user);
    return mapToDto(CommentResponseDto, comment);
  }

  @ApiOperation({ summary: 'Получить комментарии по query (публично)' })
  @ApiQuery({
    name: 'target_type',
    enum: TargetType,
    description: 'Тип сущности',
  })
  @ApiQuery({ name: 'target_id', example: 1, description: 'ID сущности' })
  @ApiResponse({
    status: 200,
    description: 'Список комментариев',
    type: [CommentResponseDto],
  })
  @Get()
  async getByQuery(
    @Query('target_type') target_type: TargetType,
    @Query('target_id', ParseIntPipe) target_id: number,
    @Request() req: any,
  ) {
    const viewerId = this.tryGetUserId(req);
    const comments = await this.commentsService.findByTarget(
      target_type,
      target_id,
      viewerId,
    );
    return comments.map((c) => mapToDto(CommentResponseDto, c));
  }

  @ApiOperation({
    summary: 'Получить комментарии по целевой сущности (публично)',
  })
  @ApiParam({
    name: 'target_type',
    enum: TargetType,
    description: 'Тип сущности',
  })
  @ApiParam({ name: 'target_id', example: 1, description: 'ID сущности' })
  @ApiResponse({
    status: 200,
    description: 'Список комментариев',
    type: [CommentResponseDto],
  })
  @Get(':target_type/:target_id')
  async getComments(
    @Param('target_type') target_type: TargetType,
    @Param('target_id', ParseIntPipe) target_id: number,
    @Request() req: any,
  ) {
    const viewerId = this.tryGetUserId(req);
    const comments = await this.commentsService.findByTarget(
      target_type as any,
      target_id,
      viewerId,
    );
    return comments.map((c) => mapToDto(CommentResponseDto, c));
  }

  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Поставить/снять реакцию (like/dislike)' })
  @ApiParam({ name: 'id', example: 1, description: 'ID комментария' })
  @ApiResponse({
    status: 200,
    description: 'Комментарий с обновленной статистикой',
    type: CommentResponseDto,
  })
  @Auth()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiBody({ type: ReactCommentDto })
  @Post(':id/react')
  async react(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ReactCommentDto,
    @Request() req: any,
  ) {
    const comment = await this.commentsService.react(id, req.user, dto.value);
    return mapToDto(CommentResponseDto, comment);
  }

  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Удалить комментарий (автор или ADMIN/SUPER_ADMIN)',
  })
  @ApiParam({ name: 'id', example: 1, description: 'ID комментария' })
  @ApiResponse({ status: 200, description: 'Комментарий удален', type: Object })
  @Auth()
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    await this.commentsService.delete(id, req.user);
    return { success: true };
  }

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
