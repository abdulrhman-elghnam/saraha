import morgan from 'morgan';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { TooManyRequestsException } from './common/_EXPORT.js';
import helmet from 'helmet';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  handler: (req, res) => TooManyRequestsException({ messageCode: 114 }),
});

const appCors = cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept-Language'],
});

const jsonParse = express.json();
const appMorgan = morgan('dev');
const appHelmet = helmet()
export const appConfig = { limiter, appCors, appMorgan, appHelmet, jsonParse };
