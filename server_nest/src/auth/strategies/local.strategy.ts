import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import {
  Injectable,
  UnauthorizedException,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from '../auth.service';
import { User } from '../../user/user.entity';
import { LoginAttemptsService } from '../login-attempts.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(LocalStrategy.name);

  constructor(
    private readonly authService: AuthService,
    private readonly loginAttemptsService: LoginAttemptsService,
  ) {
    super({ usernameField: 'email', passReqToCallback: true });
  }

  private extractIp(req: Request): string {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string' && forwarded.length > 0) {
      return forwarded.split(',')[0].trim();
    }
    if (Array.isArray(forwarded) && forwarded.length > 0 && forwarded[0]) {
      return forwarded[0];
    }
    return req.ip ?? 'unknown';
  }

  async validate(req: Request, email: string, password: string): Promise<User> {
    const clientIp = this.extractIp(req);

    try {
      this.loginAttemptsService.ensureNotBlocked(email);
    } catch (err) {
      if (err instanceof HttpException && err.getStatus() === HttpStatus.TOO_MANY_REQUESTS) {
        this.logger.warn(`Blocked login attempt for email: ${email} from IP: ${clientIp}`);
      }
      throw err;
    }

    const user = await this.authService.validateUser(email, password);
    if (!user) {
      const isBlocked = this.loginAttemptsService.registerFailure(email, clientIp);
      this.logger.warn(`Invalid login attempt for email: ${email} from IP: ${clientIp}`);
      if (isBlocked) {
        throw new HttpException(
          'Too many login attempts. Please try again later.',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
      throw new UnauthorizedException('Invalid email or password');
    }

    this.loginAttemptsService.reset(email);
    return user;
  }
}
