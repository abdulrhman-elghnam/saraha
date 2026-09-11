import { Router } from 'express';
import { mainController, notFoundController } from './app.service.js';
import { authenticationController } from './module/index.js';
const router = Router();

router.use('/authentication', authenticationController);
// router.use('/user', userController);
// router.use('/message', messageController);
router.get('/', (request, response) => mainController(response));
router.all('/{*splash}', () => notFoundController());

export default router;
