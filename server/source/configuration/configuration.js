import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config({
  path: path.resolve(process.cwd(), `.env.${process.env.NODE_ENV || 'development'}`),
});

export const config = {
  ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT) || 3000,

  DATABASE_URI: process.env.DATABASE_URI,

  FRONTEND_URL: process.env.FRONTEND_URL,

  ENCRYPTION_SECRET_KEY: process.env.ENCRYPTION_SECRET_KEY,
  IV_LENGTH: parseInt(process.env.IV_LENGTH) || 16,
  HASH_SALT: parseInt(process.env.HASH_SALT) || 10,

  ACCESS_USER_TOKEN_SECRET: process.env.ACCESS_USER_TOKEN_SECRET,
  ACCESS_USER_TOKEN_EXPIRY: parseInt(process.env.ACCESS_USER_TOKEN_EXPIRY || '900'),

  ACCESS_ADMIN_TOKEN_SECRET: process.env.ACCESS_ADMIN_TOKEN_SECRET,
  ACCESS_ADMIN_TOKEN_EXPIRY: parseInt(process.env.ACCESS_ADMIN_TOKEN_EXPIRY || '900'),

  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
  REFRESH_TOKEN_EXPIRY: parseInt(process.env.REFRESH_TOKEN_EXPIRY || '31536000'),
  ROTATION_WINDOW : parseInt(process.env.ROTATION_WINDOW || '300'),
};
