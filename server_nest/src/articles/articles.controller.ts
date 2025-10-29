import {
  Controller,
  Get,
  Query,
  Param,
  ParseIntPipe,
  DefaultValuePipe,
  Post,
  Body,
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { Article } from './article.entity';
import { ArticleWithExercises } from './interfaces/article-with-exercises.interface';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { Exercise } from './entities/exercise.entity';

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

  /** 🔍 Получить статью по ID (с упражнениями и заданиями) */
  @Get(':id')
  async getById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ArticleWithExercises> {
    return this.articlesService.getById(id);
  }

  @Post(':id/exercises')
  async addExerciseToArticle(
    @Param('id', ParseIntPipe) articleId: number,
    @Body() dto: CreateExerciseDto,
  ): Promise<Exercise> {
    return this.articlesService.addExerciseToArticle(articleId, dto);
  }
}
