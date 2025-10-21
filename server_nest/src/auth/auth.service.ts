import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { User, UserRole } from '../user/user.entity';
import { jwtConstants } from './constants';

interface JwtPayload {
  sub: string;
  role: UserRole;
}

interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Проверка валидности пользователя
   */
  async validateUser(
    email: string,
    password: string,
  ): Promise<Omit<User, 'password'> | null> {
    const user = await this.userService.findByEmail(email);
    if (
      user &&
      (await this.userService.validatePassword(password, user.password))
    ) {
      // исключаем пароль из результата
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...result } = user;
      return result;
    }
    return null;
  }

  /**
   * Генерация Access и Refresh токенов
   */
  private generateTokens(user: User): AuthTokens {
    const payload: JwtPayload = {
      sub: String(user.id),
      role: user.role,
    };

    const accessOptions: JwtSignOptions = {
      secret: jwtConstants.secret,
      expiresIn: jwtConstants.expiresIn as JwtSignOptions['expiresIn'],
    };

    const refreshOptions: JwtSignOptions = {
      secret: jwtConstants.refreshSecret,
      expiresIn: jwtConstants.refreshExpiresIn as JwtSignOptions['expiresIn'],
    };

    const access_token = this.jwtService.sign(payload, accessOptions);
    const refresh_token = this.jwtService.sign(payload, refreshOptions);
    console.log('🪙 Access token payload:', payload);
    console.log('🔁 Refresh token payload:', payload);
    console.log('🧩 Access secret:', jwtConstants.secret);
    console.log('🧩 Refresh secret:', jwtConstants.refreshSecret);

    return { access_token, refresh_token };
  }

  /**
   * Логин
   */
  async login(user: User): Promise<AuthTokens> {
    return this.generateTokens(user);
  }

  /**
   * Регистрация
   */
  async register(email: string, password: string): Promise<AuthTokens> {
    const user = await this.userService.create(email, password);
    if (!user) {
      throw new UnauthorizedException('User creation failed');
    }
    return this.generateTokens(user);
  }

  /**
   * Обновление токена
   */
  async refreshToken(refresh_token: string): Promise<AuthTokens> {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(
        refresh_token,
        {
          secret: jwtConstants.refreshSecret,
        },
      );

      const user = await this.userService.findById(String(payload.sub));
      if (!user) throw new UnauthorizedException('User not found');

      return this.generateTokens(user);
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }
}
