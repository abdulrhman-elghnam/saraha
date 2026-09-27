import { Router } from 'express';
import { mainController, notFoundController } from './app.service.js';
import {
  authenticationController,
  userController,
  messageController,
  notificationController,
} from './module/_index.js';
import { acceptLanguage, ApiLanguageEnum } from './common/_index.js';
const router = Router();

router.use('/authentication', authenticationController);
router.use('/user', userController);
router.use('/message', messageController);
router.use('/notification', notificationController);
router.get('/', (request, response) => mainController(acceptLanguage({ request }), response));
router.all('/{*splash}', (request) => notFoundController(acceptLanguage({ request })));

export default router;
