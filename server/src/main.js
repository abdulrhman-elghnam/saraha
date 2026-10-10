import express from 'express';
import { databaseConnection, cacheClient, PORT } from '#/core/_EXPORT.js';
import { globalErrorHandler } from './common/_EXPORT.js';
import { appConfig } from './appConfig.js';
import { appController } from './appController.js';
import { LOCAL_UPLOAD_DIRECTORY } from './common/upload/multerLocal.js';
const app = express();

app.use(Object.values(appConfig));
app.use('/assets', express.static(LOCAL_UPLOAD_DIRECTORY));
app.use(appController);
app.use(globalErrorHandler);
const main = async () => {
  try {
    await Promise.all([databaseConnection, cacheClient.connect()]);
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
