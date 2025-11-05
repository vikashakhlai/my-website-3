// src/common/errors/http-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    const isHttp = exception instanceof HttpException;
    const status = isHttp
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const responseBody = isHttp
      ? exception.getResponse()
      : { message: 'Internal server error' };
    const payload =
      typeof responseBody === 'string'
        ? { message: responseBody }
        : (responseBody as Record<string, unknown>);

    // Никогда не отдаём stack/внутренние детали наружу в prod
    const safe = {
      statusCode: status,
      path: req.originalUrl,
      method: req.method,
      timestamp: new Date().toISOString(),
      ...payload,
    };

    // Можно логгировать exception отдельно (Sentry/ELK), но не выдавать клиенту
    res.status(status).json(safe);
    console.error(exception);
  }
}
