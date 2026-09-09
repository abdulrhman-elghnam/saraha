import { Router } from 'express';
import { mainController, notFoundController } from './app.service.js';

const router = Router();

router.get('/', (req, res) => mainController(req, res));
router.all('/{*splash}', (req, res, next) => notFoundController(req, res, next));


export default router