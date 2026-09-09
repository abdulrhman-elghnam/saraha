import { NotFoundException } from './common/index.js';
import { sendSuccess } from './common/main/structure/index.js';

export const mainController = (req, res) => sendSuccess({ res, message: 'hello from backend 🚀' });
export const notFoundController = (req, res) => NotFoundException({ message: 'route not found' });
