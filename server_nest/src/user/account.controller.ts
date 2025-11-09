// src/user/account.controller.ts
import {
  Controller,
  Get,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { AccountService } from './account.service';
import { AccountFavoritesResponse } from './account.service';
import { TrendingItem } from 'src/ratings/ratings.service';

interface RequestWithUser extends Request {
  user: { id: string };
}

@ApiTags('Account')
@ApiBearerAuth('access-token')
@ApiSecurity('access-token')
@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @ApiOperation({ summary: 'Получить избранное пользователя, сгруппированное по типам' })
  @ApiResponse({ status: 200, description: 'Список избранных элементов' })
  @Get('favorites')
  async getFavorites(@Req() req: RequestWithUser): Promise<AccountFavoritesResponse> {
    return this.accountService.getFavoritesOverview(req.user.id);
  }

  @ApiOperation({ summary: 'Получить персональные рекомендации' })
  @ApiResponse({ status: 200, description: 'Список рекомендованных элементов' })
  @Get('recommendations')
  async getRecommendations(@Req() req: RequestWithUser): Promise<TrendingItem[]> {
    return this.accountService.getRecommendations(req.user.id);
  }
}

