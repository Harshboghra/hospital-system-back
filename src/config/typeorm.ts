import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { DataSourceOptions } from 'typeorm';

ConfigModule.forRoot();
export const typeOrmConfig = (): DataSourceOptions => {
  return {
    type: 'postgres',
    host: process.env.POSTGRES_HOST,
    port: +process.env.POSTGRES_PORT,
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    entities: [
      join(__dirname, '..', '**', '*.entity.{ts,js}'),
      join(__dirname, '..', '**', 'entities/*.{ts,js}'),
    ],
    migrations: [join(__dirname, '..', '**', '/migrations/*.{ts,js}')],
    synchronize: false,
    migrationsTableName: 'migrations',
  };
};
