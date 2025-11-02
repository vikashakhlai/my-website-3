import {
  Controller,
  Get,
  Query,
  Param,
  ParseIntPipe,
  DefaultValuePipe,
  Post,
  Body,
  UseGuards,
  Request,
  Put,
  Delete,
  Sse,
  MessageEvent,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { interval, Observable, switchMap } from 'rxjs';

import { ArticlesService } from './articles.service';
import { Article } from './article.entity';
import { Exercise } from './entities/exercise.entity';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/roles.enum';

import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { RateArticleDto } from './dto/rate-article.dto';
import { CreateArticleCommentDto } from './dto/create-article-comment.dto';
import { CreateExerciseDto } from './dto/create-exercise.dto';

import { RatingsService } from 'src/ratings/ratings.service';
import { CommentsService } from 'src/comments/comments.service';
import { TargetType } from 'src/common/enums/target-type.enum';
import { Public } from 'src/auth/decorators/public.decorator';
import { FavoritesService } from 'src/favorites/favorites.service';

@ApiTags('Articles')
@Controller('articles')
export class ArticlesController {
  constructor(
    private readonly articlesService: ArticlesService,
    private readonly ratingsService: RatingsService,
    private readonly commentsService: CommentsService,
    private readonly favoritesService: FavoritesService,
  ) {}

  /** 📰 Последние статьи (публично) */
  @ApiOperation({ summary: 'Последние статьи (публично)' })
  @Get('latest')
  async getLatest(
    @Query('limit', new DefaultValuePipe(3), ParseIntPipe) limit: number,
  ): Promise<Article[]> {
    return this.articlesService.getLatest(limit);
  }

  /** 📋 Список статей (публично, с фильтром по теме) */
  @ApiOperation({ summary: 'Список статей (публично)' })
  @Get()
  async getArticles(
    @Query('theme') theme?: string,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
  ): Promise<Article[]> {
    return this.articlesService.getArticles(theme, limit);
  }

  /** 🔍 Публичная статья. Если передан JWT — добавится userId */
  @ApiOperation({
    summary: 'Получить статью (публично). JWT добавит userId в результат',
  })
  @Get(':id')
  async getById(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.articlesService.getById(id, req.user?.sub);
  }

  // ===== CRUD (ADMIN+) =====

  @ApiOperation({ summary: 'Создать статью (ADMIN+)' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Post()
  async create(@Body() dto: CreateArticleDto) {
    return this.articlesService.create(dto);
  }

  @ApiOperation({ summary: 'Обновить статью (ADMIN+)' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateArticleDto,
  ) {
    return this.articlesService.update(id, dto);
  }

  @ApiOperation({ summary: 'Удалить статью (ADMIN+)' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.articlesService.remove(id);
  }

  // ===== Exercises =====

  @ApiOperation({ summary: 'Список упражнений (только авторизованные)' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Get(':id/exercises')
  async getExercises(@Param('id', ParseIntPipe) id: number) {
    return this.articlesService.findExercisesByArticle(id);
  }

  @ApiOperation({ summary: 'Добавить упражнение (ADMIN+)' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Post(':id/exercises')
  async addExerciseToArticle(
    @Param('id', ParseIntPipe) articleId: number,
    @Body() dto: CreateExerciseDto,
  ): Promise<Exercise> {
    dto.articleId = articleId;
    return this.articlesService.addExerciseToArticle(articleId, dto);
  }

  // ===== Rating =====

  @ApiOperation({ summary: 'Оценить статью (1–5)' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Post(':id/ratings')
  async rate(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RateArticleDto,
    @Request() req,
  ) {
    return this.articlesService.rateArticle(id, req.user.sub, dto.value);
  }

  @ApiOperation({ summary: 'Live-поток рейтинга (публично, SSE)' })
  @Public()
  @Sse('stream/:id/rating')
  streamRating(
    @Param('id', ParseIntPipe) id: number,
  ): Observable<MessageEvent> {
    return interval(5000).pipe(
      switchMap(async () => {
        const stats = await this.ratingsService.getAverage(
          TargetType.ARTICLE,
          id,
        );
        return { data: stats };
      }),
    );
  }

  // ===== Comments =====

  @ApiOperation({ summary: 'Список комментариев (публично)' })
  @Get(':id/comments')
  async getComments(@Param('id', ParseIntPipe) id: number) {
    return this.commentsService.findByTarget(TargetType.ARTICLE, id);
  }

  @ApiOperation({ summary: 'Добавить комментарий (авторизованные)' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Post(':id/comments')
  async addComment(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateArticleCommentDto,
    @Request() req,
  ) {
    return this.commentsService.create(
      {
        target_type: TargetType.ARTICLE,
        target_id: id,
        content: dto.content,
        parent_id: dto.parentId ?? undefined,
      },
      req.user,
    );
  }

  @ApiOperation({ summary: 'Live-комментарии (публично, SSE)' })
  @Public()
  @Sse('stream/:id/comments')
  streamComments(
    @Param('id', ParseIntPipe) id: number,
  ): Observable<MessageEvent> {
    return interval(5000).pipe(
      switchMap(async () => ({
        data: await this.commentsService.findByTarget(TargetType.ARTICLE, id),
      })),
    );
  }

  /** 💛 Добавить статью в избранное */
  @ApiOperation({ summary: 'Добавить статью в избранное' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Post(':id/favorite')
  async addToFavorites(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.favoritesService.addToFavorites(req.user.sub, {
      targetType: TargetType.ARTICLE,
      targetId: id,
    });
  }

  /** 💔 Удалить статью из избранного */
  @ApiOperation({ summary: 'Удалить статью из избранного' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Delete(':id/favorite')
  async removeFromFavorites(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ) {
    return this.favoritesService.removeFromFavorites(req.user.sub, {
      targetType: TargetType.ARTICLE,
      targetId: id,
    });
  }
}
