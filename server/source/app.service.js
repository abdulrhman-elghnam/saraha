import { NotFoundException } from './common/_index.js';
import { sendSuccess } from './common/structure/_index.js';

export const mainController = (response) =>
  sendSuccess({ response, statusCode: 200, message: 'hello from backend server 🫡' });
export const notFoundController = () => NotFoundException({ message: 'route is not exist 👀' });
