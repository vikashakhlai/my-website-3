import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
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

    const safe = {
      statusCode: status,
      path: req.originalUrl,
      method: req.method,
      timestamp: new Date().toISOString(),
      ...payload,
    };

    res.status(status).json(safe);
    console.error(exception);
  }
}
