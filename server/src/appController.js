import { Router } from 'express';

import { authController } from './module/auth/authController.js';
import { acceptLanguage } from './common/util/_INDEX.js';
import { mainFeedbackService, notFoundFeedbackService } from './appService.js';
import { userController } from './module/user/userController.js';

export const appController = Router();

appController.use('/authentication', authController);
appController.use('/user', userController);
appController.get('/', (req, res) => mainFeedbackService({ lang: acceptLanguage({ req }), res }));
appController.all('/{*splash}', () => notFoundFeedbackService());
