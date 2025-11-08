export interface AppError extends Error {
  status?: number;
  code?: string;
  context?: string;
}

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
