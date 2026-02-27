import { DataSource } from 'typeorm';
import * as path from 'path';

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: path.join(__dirname, '../../otbook.sqlite'),
  entities: [path.join(__dirname, '../**/*.entity{.ts,.js}')],
  migrations: [path.join(__dirname, './migrations/*{.ts,.js}')],
  synchronize: false, // 프로덕션에서는 false (migration 사용)
  logging: true,
});
