// src/middlewares/csrf.middleware.ts
import type { Request, Response, NextFunction } from 'express';
import { ForbiddenException } from '@nestjs/common';
import type { AppConfig } from 'src/config/configuration.types';
import {
  CSRF_COOKIE_NAME,
  CSRF_HEADER_NAME,
} from 'src/common/utils/csrf.util';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

function isSse(req: Request): boolean {
  const accept = req.headers.accept;
  return typeof accept === 'string' && accept.includes('text/event-stream');
}

function normalizeUrlSegment(segment: string): string {
  return segment.startsWith('/') ? segment.toLowerCase() : `/${segment.toLowerCase()}`;
}

export function createCsrfMiddleware(appConfig: AppConfig) {
  const apiPrefix = normalizeUrlSegment(appConfig.apiPrefix);
  const swaggerPaths = [
    '/api/docs',
    '/api-json',
    `${apiPrefix}/api/docs`,
    `${apiPrefix}/api-json`,
  ];
  const healthPaths = ['/health', `${apiPrefix}/health`];

  return function csrfMiddleware(
    req: Request,
    _res: Response,
    next: NextFunction,
  ) {
    const method = req.method?.toUpperCase();
    if (!method || SAFE_METHODS.has(method)) {
      return next();
    }

    if (isSse(req)) {
      return next();
    }

    const originalUrl = (req.originalUrl || req.url || '').toLowerCase();

    if (originalUrl.startsWith('/uploads')) {
      return next();
    }

    if (swaggerPaths.some((path) => originalUrl.startsWith(path))) {
      return next();
    }

    if (healthPaths.some((path) => originalUrl.startsWith(path))) {
      return next();
    }

    const csrfCookie = req.cookies?.[CSRF_COOKIE_NAME];
    const headerValueRaw = req.headers[CSRF_HEADER_NAME.toLowerCase()];
    const headerValue = Array.isArray(headerValueRaw)
      ? headerValueRaw[0]
      : headerValueRaw;

    if (
      !csrfCookie ||
      !headerValue ||
      typeof headerValue !== 'string' ||
      headerValue !== csrfCookie
    ) {
      return next(new ForbiddenException('CSRF token mismatch'));
    }

    return next();
  };
}

