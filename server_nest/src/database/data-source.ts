import { config } from 'dotenv';
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { toAppError } from '../common/errors/typed-error';
import { DatabaseConfig } from '../config/configuration.types';
import { loadDatabaseConfig } from './database.config';

config();

let db: DatabaseConfig;

try {
  db = loadDatabaseConfig();
} catch (err: unknown) {
  const error = toAppError(err, 'data-source');
  console.error('Ошибка загрузки конфигурации базы данных:', error.message);
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
  synchronize: false,
});

export default AppDataSource;
