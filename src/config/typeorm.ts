import 'dotenv/config';
import { DataSourceOptions } from 'typeorm';
import { join } from 'path';

const baseOptions: Omit<
  DataSourceOptions,
  'url' | 'host' | 'port' | 'username' | 'password' | 'database'
> = {
  type: 'postgres',
  entities: [
    join(__dirname, '..', '**', '*.entity.{ts,js}'),
    join(__dirname, '..', '**', 'entities/*.{ts,js}'),
  ],
  migrations: [join(__dirname, '..', 'migrations/*.{ts,js}')],
  synchronize: false,
  migrationsTableName: 'migrations',
};

const dataSourceOptions: DataSourceOptions = process.env.DATABASE_URL
  ? {
      ...baseOptions,
      type: 'postgres',
      url: process.env.DATABASE_URL,
    }
  : {
      ...baseOptions,
      type: 'postgres',
      host: process.env.POSTGRES_HOST ?? 'localhost',
      port: +(process.env.POSTGRES_PORT ?? 5433),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
    };

export const typeOrmConfig = (): DataSourceOptions => {
  return {
    ...dataSourceOptions,
  };
};
