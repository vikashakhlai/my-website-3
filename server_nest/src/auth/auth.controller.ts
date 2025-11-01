// src/auth/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Request } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthTokens } from './interfaces/auth-tokens.interface';
import { UserResponseDto } from 'src/user/dto/user-response.dto';
import { Public } from './decorators/public.decorator';

interface RequestWithUser extends Request {
  user: any;
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ✅ Регистрация (публичный маршрут)
  @Public()
  @ApiOperation({ summary: 'Регистрация нового пользователя' })
  @ApiResponse({
    status: 201,
    description: 'Успешная регистрация, возвращает user + tokens',
  })
  @Post('register')
  async register(@Body() dto: RegisterDto): Promise<AuthTokens> {
    return this.authService.register(dto.email, dto.password);
  }

  // ✅ Логин (публичный маршрут, использует LocalStrategy)
  @Public()
  @ApiOperation({ summary: 'Авторизация, получение JWT токенов' })
  @ApiResponse({
    status: 200,
    description: 'Успешный вход, возвращает user + tokens',
  })
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() req: RequestWithUser): Promise<AuthTokens> {
    if (!req.user) throw new UnauthorizedException('Неверные учетные данные');
    return this.authService.login(req.user);
  }

  // ✅ Профиль (закрытый маршрут)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Профиль пользователя по access-токену' })
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Req() req: RequestWithUser): UserResponseDto {
    if (!req.user) throw new UnauthorizedException('Токен недействителен');
    return this.authService.toResponseDto(req.user);
  }

  // ✅ Обновление токенов (публичный маршрут)
  @Public()
  @ApiOperation({ summary: 'Обновить access токен по refresh токену' })
  @Post('refresh')
  async refresh(@Body() dto: RefreshTokenDto): Promise<AuthTokens> {
    return this.authService.refreshToken(dto.refresh_token);
  }
}
