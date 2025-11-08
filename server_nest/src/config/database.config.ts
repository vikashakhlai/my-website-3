import { registerAs } from '@nestjs/config';
import { DatabaseConfig } from './configuration.types';

/**
 * Конфигурация базы данных PostgreSQL
 *
 * Загружает настройки подключения к базе данных из переменных окружения.
 * Все поля обязательны для корректной работы приложения.
 *
 * @example
 * {
 *   host: "localhost",
 *   port: 5432,
 *   username: "postgres",
 *   password: "password",
 *   database: "my_database"
 * }
 */
export default registerAs<DatabaseConfig>('database', (): DatabaseConfig => {
  const host = process.env.DB_HOST;
  const port = process.env.DB_PORT;
  const username = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const database = process.env.DB_NAME;

  // Валидация обязательных полей
  if (!host) {
    throw new Error('DB_HOST is required but not set in environment variables');
  }
  if (!port) {
    throw new Error('DB_PORT is required but not set in environment variables');
  }
  if (!username) {
    throw new Error('DB_USER is required but not set in environment variables');
  }
  if (!password) {
    throw new Error('DB_PASSWORD is required but not set in environment variables');
  }
  if (!database) {
    throw new Error('DB_NAME is required but not set in environment variables');
  }

  const portNumber = Number(port);
  if (isNaN(portNumber) || portNumber <= 0 || portNumber > 65535) {
    throw new Error(`DB_PORT must be a valid port number (1-65535), got: ${port}`);
  }

  return {
    host,
    port: portNumber,
    username,
    password,
    database,
  };
});
