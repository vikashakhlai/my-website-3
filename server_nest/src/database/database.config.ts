import { registerAs } from '@nestjs/config';
import { DatabaseConfig } from '../config/configuration.types';

export const loadDatabaseConfig = (): DatabaseConfig => ({
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_NAME ?? 'postgres',
});

// ✅ используется Nest'ом
export default registerAs<DatabaseConfig>('database', loadDatabaseConfig);
