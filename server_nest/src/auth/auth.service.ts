import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { User } from '../user/user.entity';
import { jwtConstants } from './constants';
import { Role } from './roles.enum';
import { UserResponseDto } from 'src/user/dto/user-response.dto';

interface JwtPayload {
  sub: string;
  role: Role;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  user: UserResponseDto; // ✅ теперь обязательный
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
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

  private generateTokens(user: User): Omit<AuthTokens, 'user'> {
    const payload: JwtPayload = {
      sub: String(user.id),
      role: user.role,
    };

    const accessOptions: JwtSignOptions = {
      secret: jwtConstants.secret,
      expiresIn: jwtConstants.expiresIn as any,
    };

    const refreshOptions: JwtSignOptions = {
      secret: jwtConstants.refreshSecret,
      expiresIn: jwtConstants.refreshExpiresIn as any,
    };

    return {
      access_token: this.jwtService.sign(payload, accessOptions),
      refresh_token: this.jwtService.sign(payload, refreshOptions),
    };
  }

  async login(user: User) {
    const fullUser = await this.userService.findById(user.id);
    const tokens = this.generateTokens(fullUser);

    return {
      user: this.toResponseDto(fullUser),
      ...tokens,
    };
  }

  async register(email: string, password: string) {
    const existing = await this.userService.findByEmail(email);
    if (existing) {
      throw new BadRequestException('User with this email already exists');
    }

    const user = await this.userService.create(email, password);
    const fullUser = await this.userService.findById(user.id);
    const tokens = this.generateTokens(fullUser);

    return {
      user: this.toResponseDto(fullUser),
      ...tokens,
    };
  }

  async refreshToken(refresh_token: string) {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(
        refresh_token,
        { secret: jwtConstants.refreshSecret },
      );

      const user = await this.userService.findById(payload.sub);
      if (!user) throw new UnauthorizedException('User not found');

      const tokens = this.generateTokens(user);

      return {
        user: this.toResponseDto(user),
        ...tokens,
      };
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  toResponseDto(user: User): UserResponseDto {
    const { password, ...safeUser } = user;
    return safeUser as UserResponseDto;
  }
}
