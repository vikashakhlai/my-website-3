// src/common/errors/typed-error.ts

/**
 * Унифицированная типизация ошибок в проекте
 * 
 * Расширяет стандартный Error интерфейс дополнительными полями
 * для лучшей обработки ошибок в приложении.
 * 
 * @example
 * ```typescript
 * try {
 *   // some operation
 * } catch (err) {
 *   const appError = toAppError(err, 'BooksService.create');
 *   logger.error(appError.message, appError.stack);
 * }
 * ```
 */
export interface AppError extends Error {
  /** HTTP статус код ошибки (если применимо) */
  status?: number;
  /** Код ошибки для программной обработки */
  code?: string;
  /** Контекст возникновения ошибки (например, 'BooksService.create') */
  context?: string;
  /** Дополнительные данные об ошибке */
  details?: Record<string, unknown>;
}

/**
 * Безопасное приведение unknown к AppError
 * 
 * Преобразует любое значение в структурированный объект ошибки,
 * который можно безопасно логировать и обрабатывать.
 * 
 * @param err - Ошибка любого типа
 * @param context - Контекст возникновения ошибки (опционально)
 * @returns Структурированный объект ошибки
 * 
 * @example
 * ```typescript
 * const error = toAppError(someError, 'UserService.findById');
 * console.error(`Error in ${error.context}: ${error.message}`);
 * ```
 */
export function toAppError(err: unknown, context?: string): AppError {
  if (err instanceof Error) {
    const appErr: AppError = {
      name: err.name,
      message: err.message,
      stack: err.stack,
      context,
    };

    // Если это HttpException, извлекаем статус
    if ('getStatus' in err && typeof err.getStatus === 'function') {
      appErr.status = (err as any).getStatus();
    }

    // Если есть код ошибки
    if ('code' in err) {
      appErr.code = String(err.code);
    }

    return appErr;
  }

  // Обработка строковых ошибок
  if (typeof err === 'string') {
    return {
      name: 'StringError',
      message: err,
      context,
    };
  }

  // Обработка объектов с полем message
  if (err && typeof err === 'object' && 'message' in err) {
    return {
      name: 'ObjectError',
      message: String(err.message),
      context,
      details: err as Record<string, unknown>,
    };
  }

  // Неизвестная ошибка
  return {
    name: 'UnknownError',
    message: 'Неизвестная ошибка',
    context,
  };
}
