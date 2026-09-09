import { globalErrorHandling } from './common/index.js';
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import { config } from './../configuration/main/configuration.js';
import { databaseConnection } from './database/index.js';
import appNavigationRoutes from './app.controller.js';

export const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
  express.json(),
  morgan('dev')
);

app.use(appNavigationRoutes);
app.use(globalErrorHandling);
const main = async () => {
  try {
    await databaseConnection;
    console.log({ msg: 'connected successfully' });
    app.listen(config.PORT, () => {
      console.log({ server: `url http://127.0.0.1:${config.PORT}` });
    });
  } catch (error) {
    console.error(error);
  }
};
main();
