import { chooseLanguage } from '../i18n/_index.js';

export const sendSuccess = ({
  response,
  message = 'Success',
  messageCode,
  language,
  data = undefined,
  statusCode = 200,
  ...extra
} = {}) => {
  return response.status(statusCode).json({
    success: true,
    message:
      messageCode === undefined
        ? message
        : chooseLanguage({ Language: language, code: messageCode }),
    data,
    ...extra,
  });
};
