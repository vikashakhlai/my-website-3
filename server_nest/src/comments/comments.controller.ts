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
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from 'src/auth/constants';

@Controller('comments')
export class CommentsController {
  constructor(
    private readonly commentsService: CommentsService,
    private readonly jwtService: JwtService,
  ) {}

  // --- Создать комментарий ---
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() dto: CreateCommentDto, @Request() req) {
    return this.commentsService.create(dto, req.user);
  }

  // --- Получить комментарии по query (универсальный путь)
  @Get()
  async getByQuery(
    @Query('target_type')
    target_type: 'book' | 'article' | 'media' | 'personality' | 'textbook',
    @Query('target_id', ParseIntPipe) target_id: number,
    @Request() req: any,
  ) {
    const viewerId = this.tryGetUserId(req);
    return this.commentsService.findByTarget(target_type, target_id, viewerId);
  }

  // --- Получить комментарии по /comments/book/3
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

  // --- Поставить / переключить реакцию ---
  @UseGuards(JwtAuthGuard)
  @Post(':id/react')
  async react(
    @Param('id', ParseIntPipe) id: number,
    @Body('value') value: 1 | -1 | 0,
    @Request() req,
  ) {
    if (![1, -1, 0].includes(Number(value)))
      throw new BadRequestException('value must be 1, -1 or 0');
    return this.commentsService.react(id, req.user, value);
  }

  // --- Удалить комментарий ---
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.commentsService.delete(id, req.user);
  }

  // --- helper: достаём userId из Bearer без guard ---
  private tryGetUserId(req: any): string | undefined {
    const auth = req.headers?.authorization;
    if (!auth?.startsWith('Bearer ')) return undefined;
    try {
      const token = auth.split(' ')[1];
      const payload = this.jwtService.verify(token, {
        secret: jwtConstants.secret,
      });
      return payload?.sub;
    } catch {
      return undefined;
    }
  }
}
