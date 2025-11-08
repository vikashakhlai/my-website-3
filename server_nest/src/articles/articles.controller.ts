import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  MessageEvent,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Request,
  Sse,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { interval, Observable, switchMap } from 'rxjs';

import { Article } from './article.entity';
import { ArticlesService } from './articles.service';
import { Exercise } from './entities/exercise.entity';

import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Role } from 'src/auth/roles.enum';

import { CreateArticleCommentDto } from './dto/create-article-comment.dto';
import { CreateArticleDto } from './dto/create-article.dto';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { RateArticleDto } from './dto/rate-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

import { Public } from 'src/auth/decorators/public.decorator';
import { CommentsService } from 'src/comments/comments.service';
import { TargetType } from 'src/common/enums/target-type.enum';
import { FavoritesService } from 'src/favorites/favorites.service';
import { RatingsService } from 'src/ratings/ratings.service';

@ApiTags('Articles')
@Controller('articles')
export class ArticlesController {
  constructor(
    private readonly articlesService: ArticlesService,
    private readonly ratingsService: RatingsService,
    private readonly commentsService: CommentsService,
    private readonly favoritesService: FavoritesService,
  ) {}

  @Public()
  @ApiOperation({ summary: 'Последние статьи (публично)' })
  @Get('latest')
  async getLatest(
    @Query('limit', new DefaultValuePipe(3), ParseIntPipe) limit: number,
  ): Promise<Article[]> {
    return this.articlesService.getLatest(limit);
  }

  @Public()
  @ApiOperation({ summary: 'Список статей (публично)' })
  @Get()
  async getArticles(
    @Query('theme') theme?: string,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
  ): Promise<Article[]> {
    return this.articlesService.getArticles(theme, limit);
  }

  @Public()
  @ApiOperation({
    summary: 'Получить статью (публично). Если есть JWT — вернётся userId',
  })
  @Get(':id')
  async getById(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.articlesService.getById(id, req.user?.sub);
  }

  @ApiOperation({ summary: 'Создать статью (ADMIN, SUPER_ADMIN)' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Post()
  async create(@Body() dto: CreateArticleDto) {
    return this.articlesService.create(dto);
  }

  @ApiOperation({ summary: 'Обновить статью (ADMIN, SUPER_ADMIN)' })
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

  @ApiOperation({ summary: 'Удалить статью (ADMIN, SUPER_ADMIN)' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.articlesService.remove(id);
  }

  @ApiOperation({ summary: 'Список упражнений (только авторизованные)' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Get(':id/exercises')
  async getExercises(@Param('id', ParseIntPipe) id: number) {
    return this.articlesService.findExercisesByArticle(id);
  }

  @ApiOperation({ summary: 'Добавить упражнение (ADMIN, SUPER_ADMIN)' })
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

  @ApiOperation({ summary: 'Оценить статью (1–5, только авторизованные)' })
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

  @Public()
  @ApiOperation({ summary: 'Live-поток рейтинга (публично, SSE)' })
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

  @Public()
  @ApiOperation({ summary: 'Список комментариев (публично)' })
  @Get(':id/comments')
  async getComments(@Param('id', ParseIntPipe) id: number) {
    return this.commentsService.findByTarget(TargetType.ARTICLE, id);
  }

  @ApiOperation({ summary: 'Добавить комментарий (только авторизованные)' })
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

  @Public()
  @ApiOperation({ summary: 'Live-комментарии (публично, SSE)' })
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

  @ApiOperation({
    summary: 'Добавить статью в избранное (только авторизованные)',
  })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Post(':id/favorite')
  async addToFavorites(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.favoritesService.addToFavorites(req.user.sub, {
      targetType: TargetType.ARTICLE,
      targetId: id,
    });
  }

  @ApiOperation({
    summary: 'Удалить статью из избранного (только авторизованные)',
  })
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
