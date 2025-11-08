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
      expiresIn: (this.config.get('JWT_ACCESS_TTL') ?? '15m') as any,
      issuer: 'your-app',
      audience: 'your-frontend',
      jwtid: jti,
    };

    const refreshOptions: JwtSignOptions = {
      secret: this.config.getOrThrow('JWT_REFRESH_SECRET'),
      expiresIn: (this.config.get('JWT_REFRESH_TTL') ?? '30d') as any,
      issuer: 'your-app',
      audience: 'your-frontend',
      jwtid: jti,
    };

    return {
      access_token: this.jwtService.sign(payload, accessOptions),
      refresh_token: this.jwtService.sign(payload, refreshOptions),
    };
  }

  private async rotateAndPersistRefresh(user: User) {
    const jti = randomUUID();
    const tokens = this.signTokens(user, jti);

    const refreshHash = await bcrypt.hash(tokens.refresh_token, 12);
    await this.userService.update(user.id, {
      refreshTokenHash: refreshHash,

      tokenVersion: Date.now(),
    });

    return tokens;
  }

  private async generateTokensForUser(user: User): Promise<AuthTokens> {
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
    await this.userService.update(fullUser.id, {
      refreshTokenHash: refreshHash,
      tokenVersion: newTokenVersion,
    });

    return {
      access_token,
      refresh_token,
      user: this.toResponseDto(fullUser),
    };
  }

  async login(user: User) {
    return this.generateTokensForUser(user);
  }

  async register(email: string, password: string) {
    const existing = await this.userService.findByEmail(email);
    if (existing) {
      throw new BadRequestException('User with this email already exists');
    }

    const user = await this.userService.create(email, password);
    return this.generateTokensForUser(user);
  }

  async rotateRefreshToken(userId: string, providedRefreshToken: string) {
    if (!providedRefreshToken) {
      throw new UnauthorizedException('No refresh token provided');
    }

    const user = await this.userService.findById(userId);
    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException('Invalid session');
    }

    const isValid = await bcrypt.compare(
      providedRefreshToken,
      user.refreshTokenHash,
    );

    if (!isValid) {
      await this.revokeAllUserSessions(user.id);
      throw new ForbiddenException(
        'Refresh token reuse detected. Session revoked.',
      );
    }

    const tokens = await this.rotateAndPersistRefresh(user);
    return { user: this.toResponseDto(user), ...tokens };
  }

  async revokeAllUserSessions(userId: string) {
    await this.userService.update(userId, {
      refreshTokenHash: null,
      tokenVersion: Date.now(),
    });
  }

  toResponseDto(user: User): UserResponseDto {
    const { password, ...safeUser } = user as any;
    return safeUser as UserResponseDto;
  }
}
