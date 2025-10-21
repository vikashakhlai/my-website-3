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
import { User } from '../user/user.entity';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { RegisterDto } from './dto/register.dto';
import { AuthTokens } from './interfaces/jwt-payload.interface';

interface RequestWithUser extends Request {
  user: User;
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // 🟢 Регистрация
  @ApiOperation({ summary: 'Регистрация нового пользователя' })
  @ApiResponse({
    status: 201,
    description: 'Пользователь успешно зарегистрирован',
    type: User,
  })
  @Post('register')
  async register(@Body() dto: RegisterDto): Promise<AuthTokens> {
    return this.authService.register(dto.email, dto.password);
  }

  // 🟢 Логин
  @ApiOperation({ summary: 'Авторизация и получение JWT токенов' })
  @ApiResponse({
    status: 200,
    description: 'Успешный вход, возвращаются Access и Refresh токены',
  })
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() req: RequestWithUser): Promise<AuthTokens> {
    if (!req.user) throw new UnauthorizedException('Неверные учетные данные');
    return this.authService.login(req.user);
  }

  // 🟢 Получение текущего пользователя
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получить профиль текущего пользователя (по JWT)' })
  @ApiResponse({
    status: 200,
    description: 'Данные текущего пользователя',
    type: User,
  })
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Req() req: RequestWithUser) {
    if (!req.user) throw new UnauthorizedException('Токен недействителен');
    return req.user;
  }

  // 🟢 Обновление токена
  @ApiOperation({ summary: 'Обновление access токена по refresh токену' })
  @ApiResponse({
    status: 200,
    description: 'Возвращает новую пару Access и Refresh токенов',
  })
  @Post('refresh')
  async refresh(
    @Body('refresh_token') refresh_token: string,
  ): Promise<AuthTokens> {
    if (!refresh_token) {
      throw new UnauthorizedException('refresh_token обязателен');
    }
    return this.authService.refreshToken(refresh_token);
  }
}
