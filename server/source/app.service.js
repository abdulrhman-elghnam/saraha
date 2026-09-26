import { chooseLanguage, NotFoundException } from './common/_index.js';

import { sendSuccess } from './common/handler/_index.js';

export const mainController =  (Language, response) => {
  sendSuccess({ response, statusCode: 200, message:  chooseLanguage({ Language: parseInt(Language), code: "101" }) });
}
export const notFoundController =  (Language) => NotFoundException({ message:  chooseLanguage({ Language: parseInt(Language), code: "102" }) });
