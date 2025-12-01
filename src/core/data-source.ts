import { typeOrmConfig } from 'src/config/typeorm';
import { DataSource } from 'typeorm';

export const dataSource = new DataSource(typeOrmConfig());
