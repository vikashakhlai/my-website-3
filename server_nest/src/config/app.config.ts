import { registerAs } from '@nestjs/config';
import { AppConfig } from './configuration.types';

/**
 * Конфигурация приложения
 *
 * Общие настройки приложения: окружение, порт, URL фронтенда и бэкенда.
 *
 * @example
 * {
 *   nodeEnv: "development",
 *   port: 3001,
 *   frontendUrl: "http://localhost:5173",
 *   backendUrl: "http://localhost:3001",
 *   apiPrefix: "api/v1"
 * }
 */
export default registerAs<AppConfig>('app', (): AppConfig => {
  const nodeEnv = (process.env.NODE_ENV ||
    'development') as AppConfig['nodeEnv'];

  // Валидация NODE_ENV
  if (!['development', 'test', 'production'].includes(nodeEnv)) {
    throw new Error(
      `NODE_ENV must be one of: development, test, production. Got: ${nodeEnv}`,
    );
  }

  const port = Number(process.env.PORT || '3001');
  if (isNaN(port) || port <= 0 || port > 65535) {
    throw new Error(`PORT must be a valid port number (1-65535), got: ${port}`);
  }

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  if (!frontendUrl.startsWith('http://') && !frontendUrl.startsWith('https://')) {
    throw new Error(
      `FRONTEND_URL must be a valid URL starting with http:// or https://. Got: ${frontendUrl}`,
    );
  }

  // BACKEND_URL опционален, если не указан - формируем из порта
  let backendUrl = process.env.BACKEND_URL;
  if (!backendUrl) {
    backendUrl = `http://localhost:${port}`;
  } else if (
    !backendUrl.startsWith('http://') &&
    !backendUrl.startsWith('https://')
  ) {
    backendUrl = `http://${backendUrl}`;
  }

  return {
    nodeEnv,
    port,
    frontendUrl: frontendUrl.replace(/\/$/, ''), // Убираем trailing slash
    backendUrl: backendUrl.replace(/\/$/, ''), // Убираем trailing slash
    apiPrefix: process.env.API_PREFIX || 'api/v1',
  };
});

