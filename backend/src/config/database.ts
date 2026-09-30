import 'reflect-metadata';
import 'dotenv/config';
import { DataSource } from 'typeorm';

import { User } from '../entities/User';
import { Employee } from '../entities/Employee';
import { Salary } from '../entities/Salary';
import { Init1790681444057 } from '../migrations/1790681444057-Init';
import { AddSearchIndexes1790682000000 } from '../migrations/1790682000000-AddSearchIndexes';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  synchronize: false,
  logging: false,

  ssl: {
    rejectUnauthorized: false,
  },

  entities: [User, Employee, Salary],
  migrations: [Init1790681444057, AddSearchIndexes1790682000000],
});
