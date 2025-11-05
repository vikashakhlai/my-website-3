// src/auth/strategies/jwt-refresh.strategy.ts
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { UserService } from '../../user/user.service';
import { ConfigService } from '@nestjs/config';

function cookieExtractor(req: Request) {
  return req?.cookies?.['refresh_token'] ?? null;
}

interface JwtPayload {
  sub: string;
  jti?: string;
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private readonly userService: UserService,
    private readonly config: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      issuer: 'your-app',
      audience: 'your-frontend',
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.userService.findById(payload.sub);
    if (!user) throw new UnauthorizedException('User not found');
    // при желании: проверка jti/refreshHash (реализация ниже — в сервисе)
    return { id: user.id, role: user.role };
  }
}
