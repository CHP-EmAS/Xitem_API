import { Sequelize } from "sequelize";

export const database = new Sequelize(String(process.env.PG_DATABASE) ,String(process.env.PG_USER), String(process.env.PG_PASSWORD), {
    host: process.env.PG_HOST,
    port: Number(process.env.PG_PORT),
    dialect: 'postgres',
    pool: {
      max: 30,
      min: 1,
      acquire: 30000,
      idle: 10000
    },
    logging: ((process.env.SEQUELIZE_LOG == 'true') ? console.log : false) || false,
    dialectOptions: {
      useUTC: true,
    },
});

export const databaseSchema = String(process.env.PG_SCHEMA) || "public";