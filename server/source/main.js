import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import { config } from './../configuration/main/configuration.js';
import { databaseConnection } from './database/index.js';
import { globalErrorHandling } from './common/index.js';
import appControllers from './app.controller.js';

const app = express();

app.use(
  express.json(),
  cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
  morgan('dev')
);

app.use(appControllers);
app.use(globalErrorHandling);
const main = async () => {
  try {
    await databaseConnection;
    console.log({ database: 'connected successfully' });
    app.listen(config.PORT, () => {
      console.log({ server: `url http://127.0.0.1:${config.PORT}` });
    });
  } catch (error) {
    console.error(error);
  }
};
main();

export default app;
