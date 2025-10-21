// src/config/configuration.types.ts
export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

export interface AllConfigType {
  database: DatabaseConfig;
}
