import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { databaseConnection } from './core/db/db.js';
import { acceptLanguage, globalErrorHandling } from './common/util/util.js';
import { chooseLanguage } from './common/lang/lang.js';

import appControllers from './app.controller.js';
import { PORT } from './core/config/config.js';
import { client } from './core/db/cache/cache.js';
const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  handler: (request, response) => {
    response.status(429).json({
      success: false,
      status: 429,
      message: chooseLanguage({
        Language: acceptLanguage({ req }),
        code: 114,
      }),
    });
  },
});

app.use(
  limiter,
  express.json(),
  cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept-Language'],
  }),
  morgan('dev')
);
app.use(appControllers);
app.use(globalErrorHandling);
const main = async () => {
  try {
    await Promise.all([databaseConnection, client.connect()]);
    console.log({ database: 'connected successfully' });
    console.log({ cache: 'connected successfully' });
    app.listen(PORT, () => {
      console.log({ server: `url http://127.0.0.1:${PORT}` });
    });
  } catch (error) {
    console.log({ error });
    process.exit(1);
  }
};
main();

export default app;
