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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

export const ALLOWED_TYPES = [
  'book',
  'textbook',
  'article',
  'media',
  'personality',
] as const;
export type FavoriteType = (typeof ALLOWED_TYPES)[number];

@ApiTags('Favorites')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @ApiOperation({ summary: 'Добавить элемент в избранное' })
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

  @ApiOperation({ summary: 'Удалить элемент из избранного' })
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

  @ApiOperation({ summary: 'Получить избранное по типу' })
  @Get(':type')
  async getUserFavorites(@Param('type') type: string, @Req() req: Request) {
    const userId = (req.user as any)?.sub;
    if (!userId)
      throw new BadRequestException('Не удалось определить пользователя');

    if (type.endsWith('s')) type = type.slice(0, -1);

    if (!ALLOWED_TYPES.includes(type as FavoriteType)) {
      throw new BadRequestException(`Недопустимый тип: ${type}`);
    }

    return this.favoritesService.getUserFavorites(userId, type as FavoriteType);
  }

  @ApiOperation({ summary: 'Получить все избранное пользователя' })
  @Get()
  async getAllUserFavorites(@Req() req: Request) {
    const userId = (req.user as any)?.sub;
    if (!userId)
      throw new BadRequestException('Не удалось определить пользователя');

    return this.favoritesService.getAllUserFavorites(userId);
  }
}
