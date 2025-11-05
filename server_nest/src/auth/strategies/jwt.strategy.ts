// src/auth/strategies/jwt.strategy.ts
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../../user/user.service';
import { ConfigService } from '@nestjs/config';

interface JwtPayload {
  sub: string;
  role: string;
  jti?: string;
  tokenVersion?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly userService: UserService,
    private readonly config: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_ACCESS_SECRET'),
      issuer: 'your-app',
      audience: 'your-frontend',
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.userService.findById(payload.sub);
    if (!user) throw new UnauthorizedException('User not found');

    // опционально: инвалидировать access при изменении tokenVersion
    if (
      user.tokenVersion &&
      payload.tokenVersion &&
      user.tokenVersion !== payload.tokenVersion
    ) {
      throw new UnauthorizedException('Token is outdated');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      sub: payload.sub,
    };
  }
}
