import { chooseLanguage } from './common/lang/lang.js';
import { NotFoundException } from './common/exception/error.js';
import { sendSuccess } from './common/util/util.js';


export const mainController = (Language, res) => {
  sendSuccess({
    res,
    statusCode: 200,
    message: chooseLanguage({ Language, code: '101' }),
  });
};

export const notFoundController = () => NotFoundException({ messageCode: 102 });
