// src/auth/auth.controller.ts
import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { UserResponseDto } from 'src/user/dto/user-response.dto';
import { User } from 'src/user/user.entity';
import { AuthService, AuthTokens } from './auth.service';
import { Public } from './decorators/public.decorator';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';

interface RequestWithUser extends Request {
  user: User;
}

const COOKIE_NAME = 'refresh_token';

function setRefreshCookie(res: Response, token: string) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api/v1/auth',
    maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
  });
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @ApiOperation({ summary: 'Регистрация нового пользователя' })
  @ApiResponse({ status: 201 })
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.register(dto.email, dto.password);
    setRefreshCookie(res, result.refresh_token);
    return result;
  }

  @Public()
  @ApiOperation({ summary: 'Авторизация, получение JWT токенов' })
  @ApiResponse({ status: 200, description: 'Успешная авторизация' })
  @UseGuards(LocalAuthGuard)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('login')
  async login(
    @Req() req: RequestWithUser,
    @Res({ passthrough: true }) res: Response,
    @Body() loginDto: LoginDto, // ✅ Добавлено
  ): Promise<AuthTokens> {
    // if (!req.user) throw new UnauthorizedException('Invalid credentials');
    const result = await this.authService.login(req.user);
    setRefreshCookie(res, result.refresh_token);
    return result;
  }

  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Профиль пользователя по access-токену' })
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Req() req: RequestWithUser): UserResponseDto {
    if (!req.user) throw new UnauthorizedException('Token is invalid');
    return this.authService.toResponseDto(req.user);
  }

  @ApiOperation({ summary: 'Обновить access токен по refresh cookie' })
  @UseGuards(AuthGuard('jwt-refresh'))
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('refresh')
  async refresh(
    @Req() req: RequestWithUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies[COOKIE_NAME];
    const result = await this.authService.rotateRefreshToken(
      req.user.id,
      refreshToken,
    );
    setRefreshCookie(res, result.refresh_token);
    return result;
  }

  @ApiOperation({ summary: 'Выход (очистка refresh cookie и отзыв сессий)' })
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(
    @Req() req: RequestWithUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    res.clearCookie(COOKIE_NAME, { path: '/api/v1/auth' });
    await this.authService.revokeAllUserSessions(req.user.id);
    return { success: true };
  }
}
