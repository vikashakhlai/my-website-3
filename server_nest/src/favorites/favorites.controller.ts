// src/favorites/favorites.controller.ts
import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  Req,
  UseGuards,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import type { Request } from 'express';

// допустимые типы избранного
export const ALLOWED_TYPES = ['book', 'textbook', 'article', 'video'] as const;
export type FavoriteType = (typeof ALLOWED_TYPES)[number];

@Controller('favorites')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  /**
   * ⭐ Добавить элемент в избранное
   * Пример: POST /favorites/book/10
   */
  @Post(':type/:id')
  async addToFavorites(
    @Param('type') type: string,
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ) {
    const userId = (req.user as any)?.sub;
    if (!userId)
      throw new BadRequestException('Не удалось определить пользователя');

    if (!ALLOWED_TYPES.includes(type as FavoriteType)) {
      throw new BadRequestException(`Недопустимый тип избранного: ${type}`);
    }

    return this.favoritesService.addToFavorites(
      userId,
      id,
      type as FavoriteType,
    );
  }

  /**
   * 🗑 Удалить элемент из избранного
   * Пример: DELETE /favorites/video/12
   */
  @Delete(':type/:id')
  async removeFromFavorites(
    @Param('type') type: string,
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ) {
    const userId = (req.user as any)?.sub;
    if (!userId)
      throw new BadRequestException('Не удалось определить пользователя');

    if (!ALLOWED_TYPES.includes(type as FavoriteType)) {
      throw new BadRequestException(`Недопустимый тип избранного: ${type}`);
    }

    return this.favoritesService.removeFromFavorites(
      userId,
      id,
      type as FavoriteType,
    );
  }

  /**
   * 📋 Получить все избранные элементы по типу
   * Примеры:
   *   GET /favorites/book
   *   GET /favorites/article
   *   GET /favorites/video
   */
  @Get(':type')
  async getUserFavorites(@Param('type') type: string, @Req() req: Request) {
    const userId = (req.user as any)?.sub;
    if (!userId)
      throw new BadRequestException('Не удалось определить пользователя');

    // приводим во множественное/единичное, если нужно
    if (type.endsWith('s')) {
      type = type.slice(0, -1);
    }

    if (!ALLOWED_TYPES.includes(type as FavoriteType)) {
      throw new BadRequestException(`Недопустимый тип избранного: ${type}`);
    }

    return this.favoritesService.getUserFavorites(userId, type as FavoriteType);
  }

  /**
   * 💫 (опционально) Получить все избранные элементы пользователя
   * Пример: GET /favorites
   */
  @Get()
  async getAllUserFavorites(@Req() req: Request) {
    const userId = (req.user as any)?.sub;
    if (!userId)
      throw new BadRequestException('Не удалось определить пользователя');

    return this.favoritesService.getAllUserFavorites(userId);
  }
}
