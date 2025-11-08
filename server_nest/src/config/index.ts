/**
 * Конфигурация приложения
 *
 * Этот модуль предоставляет типизированный доступ ко всем настройкам приложения
 * через NestJS ConfigModule. Все конфигурации загружаются из переменных окружения
 * и валидируются при старте приложения.
 *
 * @example
 * ```typescript
 * import { ConfigService } from '@nestjs/config';
 * import { AllConfigType } from './config';
 *
 * constructor(private config: ConfigService<AllConfigType>) {
 *   const db = this.config.getOrThrow('database');
 *   const jwt = this.config.getOrThrow('jwt');
 *   const app = this.config.getOrThrow('app');
 * }
 * ```
 *
 * @module Config
 */

export * from './configuration.types';
export { default as databaseConfig } from './database.config';
export { default as jwtConfig } from './jwt.config';
export { default as appConfig } from './app.config';
export { envValidationSchema } from './env.validation';

