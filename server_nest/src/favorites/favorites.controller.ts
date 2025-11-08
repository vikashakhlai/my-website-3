import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseEnumPipe,
  Post,
  Req,
  UnauthorizedException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { TargetType } from 'src/common/enums/target-type.enum';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { RemoveFavoriteDto } from './dto/remove-favorite.dto';
import { FavoriteResponseItem, FavoritesService } from './favorites.service';

@ApiTags('Favorites')
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  private getUserId(req: Request): string {
    const userId = (req.user as any)?.id;
    if (!userId) throw new UnauthorizedException();
    return userId;
  }

  @ApiOperation({ summary: 'Добавить элемент в избранное' })
  @ApiBearerAuth('access-token')
  @Auth()
  @ApiBody({
    type: CreateFavoriteDto,
    examples: {
      book: { value: { targetType: 'book', targetId: 12 } },
      media: { value: { targetType: 'media', targetId: 44 } },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Элемент добавлен в избранное',
    type: Object,
  })
  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async addToFavorites(@Body() dto: CreateFavoriteDto, @Req() req: Request) {
    return this.favoritesService.addToFavorites(this.getUserId(req), dto);
  }

  @ApiOperation({ summary: 'Удалить элемент из избранного' })
  @ApiBearerAuth('access-token')
  @Auth()
  @ApiBody({
    type: RemoveFavoriteDto,
    examples: {
      book: { value: { targetType: 'book', targetId: 12 } },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Элемент удален из избранного',
    type: Object,
  })
  @Delete()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async removeFromFavorites(
    @Body() dto: RemoveFavoriteDto,
    @Req() req: Request,
  ) {
    return this.favoritesService.removeFromFavorites(this.getUserId(req), dto);
  }

  @ApiOperation({ summary: 'Получить избранное одного типа' })
  @ApiBearerAuth('access-token')
  @Auth()
  @ApiResponse({
    status: 200,
    description: 'Список избранных элементов одного типа',
    type: [Object],
  })
  @Get('by-type/:targetType')
  async getUserFavoritesByType(
    @Param('targetType', new ParseEnumPipe(TargetType)) targetType: TargetType,
    @Req() req: Request,
  ): Promise<FavoriteResponseItem[]> {
    return this.favoritesService.getUserFavoritesByType(
      this.getUserId(req),
      targetType,
    );
  }

  @ApiOperation({ summary: 'Получить всё избранное пользователя' })
  @ApiBearerAuth('access-token')
  @Auth()
  @ApiResponse({
    status: 200,
    description: 'Список всех избранных элементов пользователя',
    type: [Object],
  })
  @Get()
  async getAllUserFavorites(
    @Req() req: Request,
  ): Promise<FavoriteResponseItem[]> {
    return this.favoritesService.getAllUserFavorites(this.getUserId(req));
  }
}
