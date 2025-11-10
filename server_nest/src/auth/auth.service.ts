import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { UserResponseDto } from 'src/user/dto/user-response.dto';
import { User } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { Role } from './roles.enum';

interface JwtPayload {
  sub: string;
  role: Role;
  tokenVersion?: number;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  user: UserResponseDto;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userService.findByEmailWithPassword(email);
    if (!user) return null;

    const isPasswordValid = await this.userService.validatePassword(
      password,
      user.password,
    );

    return isPasswordValid ? user : null;
  }

  private signTokens(user: User, jti: string): Omit<AuthTokens, 'user'> {
    const payload: JwtPayload = {
      sub: String(user.id),
      role: user.role,
      tokenVersion: user.tokenVersion ?? undefined,
    };

    const accessOptions: JwtSignOptions = {
      secret: this.config.getOrThrow('JWT_ACCESS_SECRET'),
      expiresIn: this.config.get('JWT_ACCESS_TTL') ?? '15m',
      issuer: 'your-app',
      audience: 'your-frontend',
      jwtid: jti,
    };

    const refreshOptions: JwtSignOptions = {
      secret: this.config.getOrThrow('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get('JWT_REFRESH_TTL') ?? '7d',
      issuer: 'your-app',
      audience: 'your-frontend',
      jwtid: jti,
    };

    return {
      access_token: this.jwtService.sign(payload, accessOptions),
      refresh_token: this.jwtService.sign(payload, refreshOptions),
    };
  }

  private async rotateAndPersistRefresh(
    user: User,
    req: { ip?: string; userAgent?: string },
  ) {
    const jti = randomUUID();
    const tokens = this.signTokens(user, jti);

    const refreshHash = await bcrypt.hash(tokens.refresh_token, 12);
    const decodedRefresh: { exp: number } = this.jwtService.decode(
      tokens.refresh_token,
    );

    await this.userService.update(user.id, {
      refreshTokenHash: refreshHash,
      refreshTokenUserId: user.id,
      refreshTokenUserAgent: req.userAgent || undefined,
      refreshTokenIp: req.ip || undefined,
      refreshTokenExp: new Date(decodedRefresh.exp * 1000),
      tokenVersion: Date.now(),
    });

    return tokens;
  }

  private async generateTokensForUser(
    user: User,
    req: { ip?: string; userAgent?: string },
  ): Promise<AuthTokens> {
    const fullUser = await this.userService.findById(user.id);
    if (!fullUser) {
      throw new UnauthorizedException('User not found');
    }

    const newTokenVersion = Date.now();

    const payload: JwtPayload = {
      sub: String(fullUser.id),
      role: fullUser.role,
      tokenVersion: newTokenVersion,
    };

    const jti = randomUUID();
    const access_token = this.jwtService.sign(payload, {
      secret: this.config.getOrThrow('JWT_ACCESS_SECRET'),
      expiresIn: this.config.get('JWT_ACCESS_TTL') ?? '15m',
      issuer: 'your-app',
      audience: 'your-frontend',
      jwtid: jti,
    });

    const refresh_token = this.jwtService.sign(payload, {
      secret: this.config.getOrThrow('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get('JWT_REFRESH_TTL') ?? '30d',
      issuer: 'your-app',
      audience: 'your-frontend',
      jwtid: jti,
    });

    const refreshHash = await bcrypt.hash(refresh_token, 12);
    const decodedRefresh: { exp: number } =
      this.jwtService.decode(refresh_token);

    await this.userService.update(fullUser.id, {
      refreshTokenHash: refreshHash,
      refreshTokenUserId: fullUser.id,
      refreshTokenUserAgent: req.userAgent || undefined,
      refreshTokenIp: req.ip || undefined,
      refreshTokenExp: new Date(decodedRefresh.exp * 1000),
      tokenVersion: newTokenVersion,
    });

    return {
      access_token,
      refresh_token,
      user: this.toResponseDto(fullUser),
    };
  }

  async login(user: User, req: { ip?: string; userAgent?: string }) {
    return this.generateTokensForUser(user, req);
  }

  async register(
    email: string,
    password: string,
    req: { ip?: string; userAgent?: string },
  ) {
    const existing = await this.userService.findByEmail(email);
    if (existing) {
      throw new BadRequestException('User with this email already exists');
    }

    const user = await this.userService.create(email, password);
    return this.generateTokensForUser(user, req);
  }

  async rotateRefreshToken(
    userId: string,
    providedRefreshToken: string,
    req: { ip?: string; userAgent?: string },
  ) {
    if (!providedRefreshToken) {
      throw new UnauthorizedException('No refresh token provided');
    }

    const user = await this.userService.findById(userId);
    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException('Invalid session');
    }

    if (user.refreshTokenUserId !== userId) {
      await this.revokeAllUserSessions(userId);
      throw new ForbiddenException('Session mismatch');
    }

    if (
      user.refreshTokenUserAgent &&
      req.userAgent &&
      user.refreshTokenUserAgent !== req.userAgent
    ) {
      await this.revokeAllUserSessions(userId);
      throw new ForbiddenException('User agent mismatch');
    }

    if (user.refreshTokenIp && req.ip && user.refreshTokenIp !== req.ip) {
      await this.revokeAllUserSessions(userId);
      throw new ForbiddenException('IP mismatch');
    }

    if (user.refreshTokenExp && user.refreshTokenExp < new Date()) {
      await this.revokeAllUserSessions(userId);
      throw new ForbiddenException('Refresh token expired');
    }

    const isValid = await bcrypt.compare(
      providedRefreshToken,
      user.refreshTokenHash,
    );

    if (!isValid) {
      await this.revokeAllUserSessions(userId);
      throw new ForbiddenException(
        'Refresh token reuse detected. Session revoked.',
      );
    }

    const tokens = await this.rotateAndPersistRefresh(user, req);
    return { user: this.toResponseDto(user), ...tokens };
  }

  async revokeAllUserSessions(userId: string) {
    await this.userService.update(userId, {
      refreshTokenHash: undefined,
      refreshTokenUserId: undefined,
      refreshTokenUserAgent: undefined,
      refreshTokenIp: undefined,
      refreshTokenExp: undefined,
      tokenVersion: Date.now(),
    });
  }

  toResponseDto(user: User): UserResponseDto {
    const { password, ...safeUser } = user;
    return safeUser as UserResponseDto;
  }
}
