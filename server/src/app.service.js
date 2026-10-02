import { chooseLanguage } from './common/lang/lang.js';
import { NotFoundException } from './common/exception/error.js';
import { sendSuccess } from './common/handler/success.js';

export const mainController = (Language, response) => {
  sendSuccess({
    response,
    statusCode: 200,
    message: chooseLanguage({ Language, code: '101' }),
  });
};

export const notFoundController = () => NotFoundException({ messageCode: 102 });
