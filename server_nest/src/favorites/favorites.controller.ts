import {
  Controller,
  Post,
  Delete,
  Body,
  Req,
  UnauthorizedException,
  Get,
  Param,
  ParseEnumPipe,
} from '@nestjs/common';
import type { Request } from 'express';
import { FavoritesService } from './favorites.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { RemoveFavoriteDto } from './dto/remove-favorite.dto';
import { TargetType } from 'src/common/enums/target-type.enum';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('Favorites')
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  private getUserId(req: Request): string {
    const userId = (req.user as any)?.sub;
    if (!userId) throw new UnauthorizedException();
    return userId;
  }

  @ApiOperation({ summary: 'Добавить элемент в избранное' })
  @ApiBody({
    type: CreateFavoriteDto,
    examples: {
      book: { value: { targetType: 'book', targetId: 12 } },
      media: { value: { targetType: 'media', targetId: 44 } },
    },
  })
  @Post()
  async addToFavorites(@Body() dto: CreateFavoriteDto, @Req() req: Request) {
    return this.favoritesService.addToFavorites(this.getUserId(req), dto);
  }

  @ApiOperation({ summary: 'Удалить элемент из избранного' })
  @ApiBody({
    type: RemoveFavoriteDto,
    examples: {
      book: { value: { targetType: 'book', targetId: 12 } },
    },
  })
  @Delete()
  async removeFromFavorites(
    @Body() dto: RemoveFavoriteDto,
    @Req() req: Request,
  ) {
    return this.favoritesService.removeFromFavorites(this.getUserId(req), dto);
  }

  @ApiOperation({ summary: 'Получить избранное одного типа' })
  @ApiParam({
    name: 'targetType',
    enum: TargetType,
    description: 'Тип сущности (article, book, media, textbook, personality, author)',
    example: TargetType.BOOK,
  })
  @ApiResponse({
    status: 200,
    example: [
      {
        type: 'book',
        id: 12,
        data: { id: 12, title: 'Война и мир', cover: '/uploads/books/12.jpg' },
      },
    ],
  })
  @Get('by-type/:targetType')
  async getUserFavoritesByType(
    @Param('targetType', new ParseEnumPipe(TargetType)) targetType: TargetType,
    @Req() req: Request,
  ) {
    return this.favoritesService.getUserFavoritesByType(
      this.getUserId(req),
      targetType,
    );
  }

  @ApiOperation({ summary: 'Получить всё избранное пользователя' })
  @ApiResponse({
    status: 200,
    example: [
      { type: 'book', id: 12, data: { id: 12, title: 'Война и мир' } },
      { type: 'media', id: 44, data: { id: 44, title: 'Фильм о Петре I' } },
    ],
  })
  @Get()
  async getAllUserFavorites(@Req() req: Request) {
    return this.favoritesService.getAllUserFavorites(this.getUserId(req));
  }
}
