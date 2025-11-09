// src/auth/login-attempts.service.ts
import {
  Injectable,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

interface AttemptInfo {
  failures: number;
  firstFailureAt: number;
  blockedUntil?: number;
}

const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const LOCKOUT_THRESHOLD = 10;
const LOCKOUT_MS = 10 * 60 * 1000; // 10 minutes

@Injectable()
export class LoginAttemptsService {
  private readonly logger = new Logger(LoginAttemptsService.name);
  private readonly attempts = new Map<string, AttemptInfo>();

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private cleanup(email: string, now: number) {
    const key = this.normalizeEmail(email);
    const info = this.attempts.get(key);
    if (!info) {
      return;
    }

    if (info.blockedUntil && info.blockedUntil <= now) {
      this.attempts.delete(key);
      return;
    }

    if (now - info.firstFailureAt > WINDOW_MS) {
      this.attempts.delete(key);
    }
  }

  ensureNotBlocked(email: string) {
    const now = Date.now();
    const key = this.normalizeEmail(email);
    this.cleanup(key, now);

    const info = this.attempts.get(key);
    if (!info?.blockedUntil || info.blockedUntil <= now) {
      return;
    }

    throw new HttpException(
      'Too many login attempts. Please try again later.',
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }

  registerFailure(email: string, ip: string): boolean {
    const now = Date.now();
    const key = this.normalizeEmail(email);
    this.cleanup(key, now);

    const existing = this.attempts.get(key);

    let next: AttemptInfo;
    if (!existing) {
      next = { failures: 1, firstFailureAt: now };
    } else {
      const withinWindow = now - existing.firstFailureAt <= WINDOW_MS;
      const failures = withinWindow ? existing.failures + 1 : 1;
      const firstFailureAt = withinWindow ? existing.firstFailureAt : now;
      next = { failures, firstFailureAt };
    }

    if (next.failures >= LOCKOUT_THRESHOLD) {
      next.blockedUntil = now + LOCKOUT_MS;
      this.logger.warn(
        `Soft lockout activated for email "${key}" from IP "${ip}". Blocked for ${LOCKOUT_MS / 60000} minutes.`,
      );
    }

    this.attempts.set(key, next);
    return Boolean(next.blockedUntil && next.blockedUntil > now);
  }

  reset(email: string) {
    const key = this.normalizeEmail(email);
    if (this.attempts.has(key)) {
      this.attempts.delete(key);
    }
  }
}

