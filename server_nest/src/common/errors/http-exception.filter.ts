// src/common/errors/http-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Глобальный фильтр исключений для обработки всех ошибок в приложении
 * 
 * Обеспечивает безопасную обработку ошибок:
 * - Не раскрывает внутренние детали (stack traces) в production
 * - Логирует ошибки для мониторинга
 * - Возвращает структурированные ответы об ошибках
 * - Защищает от утечки информации о системе
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

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

    // Безопасный ответ - никогда не отдаём stack/внутренние детали в production
    const isProduction = process.env.NODE_ENV === 'production';
    const safe = {
      statusCode: status,
      path: req.originalUrl,
      method: req.method,
      timestamp: new Date().toISOString(),
      ...payload,
      // В development можно показать больше информации
      ...(isProduction
        ? {}
        : {
            // В development показываем тип ошибки для отладки
            error: exception instanceof Error ? exception.name : 'UnknownError',
          }),
    };

    // Логируем ошибку для мониторинга (в production можно отправлять в Sentry/ELK)
    if (status >= 500) {
      // Серверные ошибки - логируем с полной информацией
      this.logger.error(
        `Internal Server Error: ${req.method} ${req.originalUrl}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    } else if (status >= 400) {
      // Клиентские ошибки - логируем с предупреждением
      this.logger.warn(
        `Client Error: ${req.method} ${req.originalUrl} - ${status}`,
        payload,
      );
    }

    // Отправляем безопасный ответ клиенту
    res.status(status).json(safe);
  }
}
