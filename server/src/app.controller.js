import { Router } from 'express';
import { mainController, notFoundController } from './app.service.js';
import { authenticationController } from './module/auth/authentication.controller.js';
import { userController } from './module/user/user.controller.js';
import { messageController } from './module/msg/message.controller.js';
import { notificationController } from './module/notif/notification.controller.js';
import { acceptLanguage } from './common/util/util.js';
import { ApiLanguageEnum } from './common/value/enum.js';
const router = Router();

router.use('/authentication', authenticationController);
router.use('/user', userController);
router.use('/message', messageController);
router.use('/notification', notificationController);
router.get('/', (request, response) => mainController(acceptLanguage({ request }), response));
router.all('/{*splash}', (request) => notFoundController(acceptLanguage({ request })));

export default router;
