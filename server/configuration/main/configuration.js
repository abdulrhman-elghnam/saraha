import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config({
  path: path.resolve(process.cwd(), `.env.${process.env.NODE_ENV || 'development'}`),
});

export const config = {
  ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  BACKEND_URL: process.env.BACKEND_URL,

  DATABASE_URI: process.env.DATABASE_URI,
  DATABASE_NAME: process.env.DATABASE_NAME,

  FRONTEND_URL: process.env.FRONTEND_URL,
};
