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
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { Article } from './article.entity';
import { Exercise } from './entities/exercise.entity';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  /** 📰 Получить последние статьи */
  @Get('latest')
  async getLatest(
    @Query('limit', new DefaultValuePipe(3), ParseIntPipe) limit: number,
  ): Promise<Article[]> {
    return this.articlesService.getLatest(limit);
  }

  /** 📋 Получить список статей (опционально по теме) */
  @Get()
  async getArticles(
    @Query('theme') theme?: string,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
  ): Promise<Article[]> {
    return this.articlesService.getArticles(theme, limit);
  }

  /** 🔍 Получить статью по ID (с упражнениями, рейтингом и комментариями) */
  @UseGuards(JwtAuthGuard) // 👈 добавляем Guard, чтобы userId был в req.user
  @Get(':id')
  async getById(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const userId = req.user?.id;
    return this.articlesService.getById(id, userId);
  }

  /** 📘 Получить статью без авторизации (например, для публичного доступа) */
  @Get('public/:id')
  async getByIdPublic(@Param('id', ParseIntPipe) id: number) {
    return this.articlesService.getById(id);
  }

  /** ➕ Добавить упражнение к статье */
  @Post(':id/exercises')
  async addExerciseToArticle(
    @Param('id', ParseIntPipe) articleId: number,
    @Body() dto: CreateExerciseDto,
  ): Promise<Exercise> {
    return this.articlesService.addExerciseToArticle(articleId, dto);
  }
}
