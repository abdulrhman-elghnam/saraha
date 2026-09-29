import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { databaseConnection } from './database/_index.js';
import { acceptLanguage, chooseLanguage, globalErrorHandling } from './common/_index.js';
import appControllers from './app.controller.js';
import { PORT } from './configuration/_index.js';
import { client } from './database/cache/redis.js';
const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  handler: (request, response) => {
    response.status(429).json({
      success: false,
      status: 429,
      message: chooseLanguage({
        Language: acceptLanguage({ request }),
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
    console.log({ redis: 'connected successfully' });
    console.log({ database: 'connected successfully' });
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
