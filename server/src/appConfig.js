import morgan from 'morgan';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { TooManyRequestsException } from './common/_EXPORT.js';
import helmet from 'helmet';
import { generateLimiter } from './common/middleware/_EXPORT.js';

const limiter = generateLimiter({ limit: 1000, ttl: 15 });
const appCors = cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept-Language'],
});

const jsonParse = express.json();
const appMorgan = morgan('dev');
const appHelmet = helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
});

export const appConfig = { limiter, appCors, appMorgan, appHelmet, jsonParse };
