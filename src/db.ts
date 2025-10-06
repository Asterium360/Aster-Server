import { Sequelize } from 'sequelize';

export const dbName: string =
  process.env.NODE_ENV === 'test'
    ? (process.env.DB_NAME_TEST ?? process.env.DB_NAME)!
    : (process.env.DB_NAME!);

export const sequelize = new Sequelize(
  dbName,
  process.env.DB_USER!,
  process.env.DB_PASSWORD!,
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
  }
);
