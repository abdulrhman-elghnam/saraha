import { Router } from 'express';
import { mainController, notFoundController } from './app.service.js';
import { authenticationController, userController, messageController, notificationController } from './module/_index.js';
const router = Router();

router.use('/authentication', authenticationController);
router.use('/user', userController);
router.use('/message', messageController);
router.use('/notification', notificationController);
router.get('/', (request, response) => mainController(response));
router.all('/{*splash}', () => notFoundController());

export default router;
