import { registerAs } from '@nestjs/config';
import { JwtConfig } from './configuration.types';

export default registerAs<JwtConfig>('jwt', (): JwtConfig => {
  const jwtSecret = process.env.JWT_SECRET;
  const accessSecret = process.env.JWT_ACCESS_SECRET;
  const refreshSecret = process.env.JWT_REFRESH_SECRET;

  const finalAccessSecret = accessSecret || jwtSecret;
  const finalRefreshSecret = refreshSecret || jwtSecret;

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

  if (jwtSecret && (!accessSecret || !refreshSecret)) {
    console.warn(
      '⚠️  JWT_SECRET is deprecated. Please use JWT_ACCESS_SECRET and JWT_REFRESH_SECRET instead for better security.',
    );
  }

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

  const accessExpiresIn = process.env.JWT_ACCESS_TTL || '15m';
  const refreshExpiresIn = process.env.JWT_REFRESH_TTL || '30d';

  return {
    accessSecret: finalAccessSecret,
    accessExpiresIn,
    refreshSecret: finalRefreshSecret,
    refreshExpiresIn,
  };
});

