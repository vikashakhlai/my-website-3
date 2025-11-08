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
  const jwtSecret = process.env.JWT_SECRET; // Устаревший вариант для обратной совместимости
  const accessSecret = process.env.JWT_ACCESS_SECRET;
  const refreshSecret = process.env.JWT_REFRESH_SECRET;

  // Определяем финальные секреты с поддержкой обратной совместимости
  const finalAccessSecret = accessSecret || jwtSecret;
  const finalRefreshSecret = refreshSecret || jwtSecret;

  // Валидация обязательных полей
  if (!finalAccessSecret) {
    throw new Error(
      'JWT_ACCESS_SECRET or JWT_SECRET is required but not set in environment variables',
    );
  }
  if (!finalRefreshSecret) {
    throw new Error(
      'JWT_REFRESH_SECRET or JWT_SECRET is required but not set in environment variables',
    );
  }

  // Предупреждение, если используется устаревший JWT_SECRET
  if (jwtSecret && (!accessSecret || !refreshSecret)) {
    console.warn(
      '⚠️  JWT_SECRET is deprecated. Please use JWT_ACCESS_SECRET and JWT_REFRESH_SECRET instead for better security.',
    );
  }

  // Проверка минимальной длины секретов (рекомендуется минимум 32 символа)
  const nodeEnv = process.env.NODE_ENV || 'development';
  const minLength = nodeEnv === 'production' ? 32 : 16;

  if (finalAccessSecret.length < minLength) {
    console.warn(
      `⚠️  JWT access secret is shorter than ${minLength} characters (${nodeEnv} mode). Consider using a longer secret for better security.`,
    );
  }
  if (finalRefreshSecret.length < minLength) {
    console.warn(
      `⚠️  JWT refresh secret is shorter than ${minLength} characters (${nodeEnv} mode). Consider using a longer secret for better security.`,
    );
  }

  // Определяем время жизни токенов с поддержкой обратной совместимости
  const jwtExpiresIn = process.env.JWT_EXPIRES_IN; // Устаревший вариант
  const jwtAccessTtl = process.env.JWT_ACCESS_TTL; // Устаревший вариант
  const jwtRefreshTtl = process.env.JWT_REFRESH_TTL; // Устаревший вариант
  const accessExpiresIn =
    process.env.JWT_ACCESS_EXPIRES_IN ||
    jwtAccessTtl ||
    jwtExpiresIn ||
    '15m';
  const refreshExpiresIn =
    process.env.JWT_REFRESH_EXPIRES_IN || jwtRefreshTtl || '7d';

  // Предупреждения, если используются устаревшие переменные
  if (jwtAccessTtl && !process.env.JWT_ACCESS_EXPIRES_IN) {
    console.warn(
      '⚠️  JWT_ACCESS_TTL is deprecated. Please use JWT_ACCESS_EXPIRES_IN instead.',
    );
  }
  if (jwtExpiresIn && !process.env.JWT_ACCESS_EXPIRES_IN && !jwtAccessTtl) {
    console.warn(
      '⚠️  JWT_EXPIRES_IN is deprecated. Please use JWT_ACCESS_EXPIRES_IN instead.',
    );
  }
  if (jwtRefreshTtl && !process.env.JWT_REFRESH_EXPIRES_IN) {
    console.warn(
      '⚠️  JWT_REFRESH_TTL is deprecated. Please use JWT_REFRESH_EXPIRES_IN instead.',
    );
  }

  return {
    accessSecret: finalAccessSecret,
    accessExpiresIn,
    refreshSecret: finalRefreshSecret,
    refreshExpiresIn,
  };
});

