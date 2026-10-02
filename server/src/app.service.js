import { chooseLanguage } from './common/lang/lang.js';
import { NotFoundException } from './common/exception/error.js';
import { sendSuccess } from './common/util/util.js';


export const mainController = (lang, res) => {
  sendSuccess({
    res,
    statusCode: 200,
    message: chooseLanguage({ lang, code: '101' }),
  });
};

export const notFoundController = () => NotFoundException({ messageCode: 102 });
