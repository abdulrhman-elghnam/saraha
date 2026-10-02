import { Router } from 'express';
import { mainController, notFoundController } from './app.service.js';
import { authController } from './module/auth/auth.controller.js';
import { userController } from './module/user/user.controller.js';
import { messageController } from './module/msg/msg.controller.js';
import { notificationController } from './module/notif/notif.controller.js';
import { acceptLanguage } from './common/util/util.js';
const router = Router();

router.use('/authentication', authController);
router.use('/user', userController);
router.use('/message', messageController);
router.use('/notification', notificationController);
router.get('/', (req, res) => mainController(acceptLanguage({ req }), res));
router.all('/{*splash}', (req) => notFoundController(acceptLanguage({ req })));

export default router;
