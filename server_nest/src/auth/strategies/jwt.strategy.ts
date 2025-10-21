import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { jwtConstants } from '../constants';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { UserService } from '../../user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
    console.log('✅ JwtStrategy зарегистрирована');
  }

  async validate(payload: JwtPayload) {
    console.log('🔐 JWT validate() вызван, payload:', payload);
    const user = await this.userService.findById(payload.sub);

    console.log('👤 Результат поиска пользователя:', user?.id || 'не найден');

    if (!user) {
      console.warn('❌ Пользователь не найден по payload.sub =', payload.sub);
      throw new UnauthorizedException('User not found');
    }

    // Убираем пароль из объекта
    const { password, ...safeUser } = user;

    // ✅ Добавляем роль, чтобы RolesGuard мог использовать
    console.log(
      `✅ Пользователь ${safeUser.email} авторизован как ${safeUser.role}`,
    );

    return {
      ...safeUser,
      sub: payload.sub,
      role: safeUser.role,
    };
  }
}
