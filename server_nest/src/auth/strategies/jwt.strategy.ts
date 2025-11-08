import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from '../../user/user.service';

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

    const payloadTokenVersion =
      payload.tokenVersion != null ? Number(payload.tokenVersion) : null;

    const dbTokenVersion =
      user.tokenVersion != null ? Number(user.tokenVersion) : null;

    if (
      dbTokenVersion !== null &&
      payloadTokenVersion !== null &&
      dbTokenVersion !== payloadTokenVersion
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
