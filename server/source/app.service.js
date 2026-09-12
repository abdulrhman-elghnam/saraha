import { NotFoundException } from './common/index.js';
import { sendSuccess } from './common/main/structure/index.js';

export const mainController = (response) =>
  sendSuccess({ response, statusCode: 200, message: 'hello from backend 🚀' });
export const notFoundController = () => NotFoundException({ message: 'route not found' });
