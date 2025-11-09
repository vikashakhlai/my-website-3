// src/auth/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  UnauthorizedException,
  Res,
  HttpCode,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import type { CookieOptions } from 'express';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiSecurity,
  ApiResponse,
} from '@nestjs/swagger';
import { RegisterDto } from './dto/register.dto';
import { UserResponseDto } from 'src/user/dto/user-response.dto';
import { Public } from './decorators/public.decorator';
import { Throttle } from '@nestjs/throttler';
import { ConfigService } from '@nestjs/config';
import { AllConfigType, AppConfig, JwtConfig } from 'src/config/configuration.types';
import { AuthTokens } from './auth.service';
import {
  clearCsrfCookie,
  setCsrfCookie,
} from 'src/common/utils/csrf.util';

interface RequestWithUser extends Request {
  user: any;
}

const ACCESS_COOKIE = 'access_token';
const REFRESH_COOKIE = 'refresh_token';

type CookiePair = { access: CookieOptions; refresh: CookieOptions };

function parseTtlToMs(ttl: string | undefined, fallback: number): number {
  if (!ttl) {
    return fallback;
  }

  const trimmed = ttl.trim();
  const match = /^([0-9]+)(ms|s|m|h|d)?$/i.exec(trimmed);
  if (!match) {
    return fallback;
  }

  const value = Number(match[1]);
  if (Number.isNaN(value)) {
    return fallback;
  }

  const unit = match[2]?.toLowerCase();
  const multipliers: Record<string, number> = {
    ms: 1,
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  if (!unit) {
    return value * 1000;
  }

  const multiplier = multipliers[unit];
  return multiplier ? value * multiplier : fallback;
}

function buildCookieOptions(
  configService: ConfigService<AllConfigType>,
): CookiePair {
  const appConfig = configService.getOrThrow<AppConfig>('app');
  const jwtConfig = configService.getOrThrow<JwtConfig>('jwt');

  const isProd = appConfig.nodeEnv === 'production';
  let domain: string | undefined;

  try {
    domain = isProd ? new URL(appConfig.frontendUrl).hostname : undefined;
  } catch (err) {
    domain = undefined;
  }

  const base: CookieOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: (isProd ? 'none' : 'lax') as 'lax' | 'strict' | 'none',
    path: '/',
  };

  if (isProd && domain) {
    base.domain = domain;
  }

  const accessMaxAge = parseTtlToMs(jwtConfig.accessExpiresIn, 15 * 60 * 1000);
  const refreshMaxAge = parseTtlToMs(
    jwtConfig.refreshExpiresIn,
    30 * 24 * 60 * 60 * 1000,
  );

  return {
    access: { ...base, maxAge: accessMaxAge },
    refresh: { ...base, maxAge: refreshMaxAge },
  };
}

function setAuthCookies(
  res: Response,
  configService: ConfigService<AllConfigType>,
  tokens: AuthTokens,
): CookiePair {
  const options = buildCookieOptions(configService);
  res.cookie(ACCESS_COOKIE, tokens.access_token, options.access);
  res.cookie(REFRESH_COOKIE, tokens.refresh_token, options.refresh);
  return options;
}

function clearAuthCookies(
  res: Response,
  configService: ConfigService<AllConfigType>,
) {
  const options = buildCookieOptions(configService);
  const { maxAge: _accessMaxAge, ...accessRest } = options.access;
  const { maxAge: _refreshMaxAge, ...refreshRest } = options.refresh;
  res.clearCookie(ACCESS_COOKIE, accessRest);
  res.clearCookie(REFRESH_COOKIE, refreshRest);
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService<AllConfigType>,
  ) {}

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
    const cookieOptions = setAuthCookies(res, this.configService, result);
    setCsrfCookie(res, this.configService, cookieOptions.access.maxAge);
    return result;
  }

  @Public()
  @ApiOperation({ summary: 'Авторизация, получение JWT токенов' })
  @ApiResponse({ status: 200 })
  @UseGuards(LocalAuthGuard)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('login')
  async login(
    @Req() req: RequestWithUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!req.user) throw new UnauthorizedException('Invalid credentials');
    const result = await this.authService.login(req.user);
    const cookieOptions = setAuthCookies(res, this.configService, result);
    setCsrfCookie(res, this.configService, cookieOptions.access.maxAge);
    return result;
  }

  @Public()
  @Get('csrf')
  @HttpCode(204)
  rotateCsrf(@Res({ passthrough: true }) res: Response) {
    const cookieOptions = buildCookieOptions(this.configService);
    setCsrfCookie(res, this.configService, cookieOptions.access.maxAge);
  }

  @ApiBearerAuth('access-token')
  @ApiSecurity('access-token')
  @ApiOperation({ summary: 'Профиль пользователя по access-токену' })
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Req() req: RequestWithUser): UserResponseDto {
    if (!req.user) throw new UnauthorizedException('Token is invalid');
    return this.authService.toResponseDto(req.user);
  }

  @ApiBearerAuth('access-token')
  @ApiSecurity('access-token')
  @ApiOperation({ summary: 'Обновить access токен по refresh cookie' })
  @UseGuards(AuthGuard('jwt-refresh'))
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('refresh')
  async refresh(
    @Req() req: RequestWithUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.[REFRESH_COOKIE];
    const result = await this.authService.rotateRefreshToken(
      req.user.id,
      refreshToken,
    );
    const cookieOptions = setAuthCookies(res, this.configService, result);
    setCsrfCookie(res, this.configService, cookieOptions.access.maxAge);
    return result;
  }

  @ApiBearerAuth('access-token')
  @ApiSecurity('access-token')
  @ApiOperation({ summary: 'Выход (очистка refresh cookie и отзыв сессий)' })
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(
    @Req() req: RequestWithUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    clearAuthCookies(res, this.configService);
    clearCsrfCookie(res, this.configService);
    await this.authService.revokeAllUserSessions(req.user.id);
    return { success: true };
  }
}
