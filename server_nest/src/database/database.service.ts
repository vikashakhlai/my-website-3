import {
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { Pool } from 'pg';
import { ConfigService } from '@nestjs/config';
import { toAppError, AppError } from '../common/errors/typed-error';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  public pool!: Pool;

  constructor(private readonly config: ConfigService) {}

  async onModuleInit(): Promise<void> {
    try {
      const host = this.config.get<string>('DB_HOST', 'localhost');
      const port = Number(this.config.get<string>('DB_PORT', '5432'));
      const user = this.config.get<string>('DB_USER', 'postgres');
      const password = this.config.get<string>('DB_PASS', '');
      const database = this.config.get<string>('DB_NAME', 'postgres');

      this.pool = new Pool({ host, port, user, password, database });
      await this.pool.connect();

      this.logger.log('✅ PostgreSQL pool connected');
    } catch (err: unknown) {
      const error: AppError = toAppError(err, 'DatabaseService.onModuleInit');
      this.logger.error(
        `❌ Ошибка подключения к базе данных: ${error.message}`,
      );
      throw error;
    }
  }

  async onModuleDestroy(): Promise<void> {
    try {
      await this.pool.end();
      this.logger.log('✅ PostgreSQL pool closed');
    } catch (err: unknown) {
      const error: AppError = toAppError(
        err,
        'DatabaseService.onModuleDestroy',
      );
      this.logger.error(`❌ Ошибка при закрытии пула: ${error.message}`);
    }
  }
}
