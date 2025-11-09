// src/common/utils/csrf.util.ts
import { randomBytes } from 'crypto';
import type { Response } from 'express';
import type { CookieOptions } from 'express';
import type { ConfigService } from '@nestjs/config';
import type { AllConfigType, AppConfig } from 'src/config/configuration.types';

export const CSRF_COOKIE_NAME = 'XSRF-TOKEN';
export const CSRF_HEADER_NAME = 'X-CSRF-Token';

const SAFE_SAMESITE_DEV: 'lax' = 'lax';
const SAFE_SAMESITE_PROD: 'none' = 'none';

export function generateCsrfToken(): string {
  return randomBytes(32).toString('hex');
}

function resolveDomain(appConfig: AppConfig): string | undefined {
  if (appConfig.nodeEnv !== 'production') {
    return undefined;
  }

  try {
    const parsed = new URL(appConfig.frontendUrl);
    return parsed.hostname || undefined;
  } catch {
    return undefined;
  }
}

export function buildCsrfCookieOptions(
  appConfig: AppConfig,
  maxAge?: number,
): CookieOptions {
  const isProd = appConfig.nodeEnv === 'production';
  const options: CookieOptions = {
    httpOnly: false,
    secure: isProd,
    sameSite: isProd ? SAFE_SAMESITE_PROD : SAFE_SAMESITE_DEV,
    path: '/',
  };

  if (typeof maxAge === 'number') {
    options.maxAge = maxAge;
  }

  const domain = resolveDomain(appConfig);
  if (domain) {
    options.domain = domain;
  }

  return options;
}

export function setCsrfCookie(
  res: Response,
  configService: ConfigService<AllConfigType>,
  maxAge?: number,
  token?: string,
): string {
  const appConfig = configService.getOrThrow<AppConfig>('app');
  const csrfToken = token ?? generateCsrfToken();
  const options = buildCsrfCookieOptions(appConfig, maxAge);

  res.cookie(CSRF_COOKIE_NAME, csrfToken, options);
  return csrfToken;
}

export function clearCsrfCookie(
  res: Response,
  configService: ConfigService<AllConfigType>,
) {
  const appConfig = configService.getOrThrow<AppConfig>('app');
  const options = buildCsrfCookieOptions(appConfig);
  const { maxAge: _maxAge, ...clearOptions } = options;

  res.clearCookie(CSRF_COOKIE_NAME, clearOptions);
}

