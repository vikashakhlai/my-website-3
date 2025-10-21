// src/common/errors/typed-error.ts

/**
 * Унифицированная типизация ошибок в проекте.
 * Можно использовать в catch блоках для безопасного обращения к err.message и err.stack
 */

export interface AppError extends Error {
  status?: number;
  code?: string;
  context?: string; // место возникновения (например, 'BooksService.create')
}

/**
 * Безопасное приведение unknown к AppError
 */
export function toAppError(err: unknown, context?: string): AppError {
  if (err instanceof Error) {
    const appErr: AppError = {
      name: err.name,
      message: err.message,
      stack: err.stack,
      context,
    };
    return appErr;
  }

  return {
    name: 'UnknownError',
    message: typeof err === 'string' ? err : 'Неизвестная ошибка',
    context,
  };
}
