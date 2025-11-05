import { registerAs } from '@nestjs/config';
import { DatabaseConfig } from './configuration.types';

export default registerAs<DatabaseConfig>('database', () => ({
  host: process.env.DB_HOST!,
  port: Number(process.env.DB_PORT!),
  username: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_NAME!,
}));
