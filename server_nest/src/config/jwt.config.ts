import { registerAs } from '@nestjs/config';
import { JwtConfig } from './configuration.types';

/**
 * Конфигурация JWT токенов
 *
 * Настройки для генерации и валидации JWT токенов доступа и обновления.
 * Секреты должны быть длинными и случайными строками для безопасности.
 *
 * @example
 * {
 *   accessSecret: "your-super-secret-access-key",
 *   accessExpiresIn: "15m",
 *   refreshSecret: "your-super-secret-refresh-key",
 *   refreshExpiresIn: "7d"
 * }
 */
export default registerAs<JwtConfig>('jwt', (): JwtConfig => {
  const accessSecret = process.env.JWT_ACCESS_SECRET;
  const refreshSecret = process.env.JWT_REFRESH_SECRET;

  // Валидация обязательных полей
  if (!accessSecret) {
    throw new Error(
      'JWT_ACCESS_SECRET is required but not set in environment variables',
    );
  }
  if (!refreshSecret) {
    throw new Error(
      'JWT_REFRESH_SECRET is required but not set in environment variables',
    );
  }

  // Проверка минимальной длины секретов (рекомендуется минимум 32 символа)
  if (accessSecret.length < 32) {
    console.warn(
      '⚠️  JWT_ACCESS_SECRET is shorter than 32 characters. Consider using a longer secret for better security.',
    );
  }
  if (refreshSecret.length < 32) {
    console.warn(
      '⚠️  JWT_REFRESH_SECRET is shorter than 32 characters. Consider using a longer secret for better security.',
    );
  }

  return {
    accessSecret,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshSecret,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  };
});

