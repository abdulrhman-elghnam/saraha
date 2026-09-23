import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config({
  path: path.resolve(process.cwd(), `.env.${process.env.NODE_ENV || 'development'}`),
});

export const ENV = process.env.NODE_ENV || 'development';
export const PORT = parseInt(process.env.PORT || '3000', 10);
export const DATABASE_URI = process.env.DATABASE_URI;

export const FRONTEND_URL = process.env.FRONTEND_URL;

export const ENCRYPTION_SECRET_KEY = process.env.ENCRYPTION_SECRET_KEY;
export const IV_LENGTH = parseInt(process.env.IV_LENGTH || '16', 10);
export const HASH_SALT = parseInt(process.env.HASH_SALT || '10', 10);

export const OAUTH_GOOGLE_CLIENT_ID = process.env.OAUTH_GOOGLE_CLIENT_ID;
export const OAUTH_GOOGLE_CLIENT_SECRET = process.env.OAUTH_GOOGLE_CLIENT_SECRET;

export const ACCESS_USER_TOKEN_SECRET = process.env.ACCESS_USER_TOKEN_SECRET;
export const ACCESS_USER_TOKEN_EXPIRY = parseInt(process.env.ACCESS_USER_TOKEN_EXPIRY || '900', 10);

export const ACCESS_ADMIN_TOKEN_SECRET = process.env.ACCESS_ADMIN_TOKEN_SECRET;
export const ACCESS_ADMIN_TOKEN_EXPIRY = parseInt(
  process.env.ACCESS_ADMIN_TOKEN_EXPIRY || '900',
  10
);

export const REFRESH_SYSTEM_TOKEN_SECRET = process.env.REFRESH_SYSTEM_TOKEN_SECRET;
export const REFRESH_SYSTEM_TOKEN_EXPIRY = parseInt(
  process.env.REFRESH_SYSTEM_TOKEN_EXPIRY || '31536000',
  10
);
