import {
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { Pool } from 'pg';
import { ConfigService } from '@nestjs/config';
import { toAppError, AppError } from '../common/errors/typed-error';
import { AllConfigType, DatabaseConfig } from '../config/configuration.types';

/**
 * Сервис для работы с PostgreSQL через пул соединений
 *
 * Предоставляет прямой доступ к пулу соединений PostgreSQL для выполнения
 * сырых SQL запросов. Используется когда TypeORM недостаточно или нужен
 * более низкоуровневый доступ к базе данных.
 *
 * @example
 * ```typescript
 * constructor(private db: DatabaseService) {}
 *
 * async someMethod() {
 *   const result = await this.db.pool.query('SELECT * FROM users');
 *   return result.rows;
 * }
 * ```
 */
@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  public pool!: Pool;

  constructor(
    private readonly config: ConfigService<AllConfigType>,
  ) {}

  async onModuleInit(): Promise<void> {
    try {
      // Используем типизированную конфигурацию из ConfigService
      const dbConfig = this.config.getOrThrow<DatabaseConfig>('database');

      this.pool = new Pool({
        host: dbConfig.host,
        port: dbConfig.port,
        user: dbConfig.username,
        password: dbConfig.password,
        database: dbConfig.database,
        // Настройки пула для production
        max: 20, // Максимум соединений в пуле
        idleTimeoutMillis: 30000, // Закрывать неиспользуемые соединения через 30 секунд
        connectionTimeoutMillis: 2000, // Таймаут подключения 2 секунды
      });

      // Тестовое подключение
      const client = await this.pool.connect();
      try {
        await client.query('SELECT NOW()');
        this.logger.log(
          `✅ PostgreSQL pool connected to ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`,
        );
      } finally {
        client.release();
      }
    } catch (err: unknown) {
      const error: AppError = toAppError(err, 'DatabaseService.onModuleInit');
      this.logger.error(
        `❌ Ошибка подключения к базе данных: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async onModuleDestroy(): Promise<void> {
    try {
      if (this.pool) {
        await this.pool.end();
        this.logger.log('✅ PostgreSQL pool closed');
      }
    } catch (err: unknown) {
      const error: AppError = toAppError(
        err,
        'DatabaseService.onModuleDestroy',
      );
      this.logger.error(
        `❌ Ошибка при закрытии пула: ${error.message}`,
        error.stack,
      );
    }
  }
}
