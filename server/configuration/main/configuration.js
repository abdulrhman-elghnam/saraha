import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config({
  path: path.resolve(process.cwd(), `.env.${process.env.NODE_ENV || 'development'}`),
});

export const config = {
  ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,

  DATABASE_URI: process.env.DATABASE_URI,

  FRONTEND_URL: process.env.FRONTEND_URL,

  ENCRYPTION_SECRET_KEY: process.env.ENCRYPTION_SECRET_KEY,
  IV_LENGTH: parseInt(process.env.IV_LENGTH),
  HASH_SALT: parseInt(process.env.HASH_SALT),

  JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
};
