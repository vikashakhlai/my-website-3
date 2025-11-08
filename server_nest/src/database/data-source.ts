import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { toAppError } from '../common/errors/typed-error';
import { DatabaseConfig } from '../config/configuration.types';

config();

/**
 * DataSource для TypeORM миграций
 *
 * Используется для выполнения миграций базы данных через CLI команды.
 * Использует централизованную конфигурацию из переменных окружения.
 *
 * @example
 * ```bash
 * npm run typeorm migration:run
 * npm run typeorm migration:generate -- -n MigrationName
 * ```
 */
let db: DatabaseConfig;

try {
  // Загружаем конфигурацию напрямую из переменных окружения
  // Это нужно для CLI команд, которые не используют NestJS DI
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

  db = {
    host,
    port: portNumber,
    username,
    password,
    database,
  };
} catch (err: unknown) {
  const error = toAppError(err, 'data-source');
  console.error('❌ Ошибка загрузки конфигурации базы данных:', error.message);
  if (error.stack) {
    console.error(error.stack);
  }
  throw error;
}

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: db.host,
  port: db.port,
  username: db.username,
  password: db.password,
  database: db.database,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false, // Никогда не используем synchronize!
  logging: process.env.NODE_ENV === 'development',
});

export default AppDataSource;
