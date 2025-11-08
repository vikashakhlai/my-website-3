// src/config/configuration.types.ts

/**
 * Конфигурация базы данных
 */
export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

/**
 * Конфигурация JWT токенов
 */
export interface JwtConfig {
  accessSecret: string;
  accessExpiresIn: string;
  refreshSecret: string;
  refreshExpiresIn: string;
}

/**
 * Конфигурация приложения
 */
export interface AppConfig {
  nodeEnv: 'development' | 'test' | 'production';
  port: number;
  frontendUrl: string;
  backendUrl: string;
  apiPrefix: string;
}

/**
 * Объединённый тип всех конфигураций
 */
export interface AllConfigType {
  database: DatabaseConfig;
  jwt: JwtConfig;
  app: AppConfig;
}
