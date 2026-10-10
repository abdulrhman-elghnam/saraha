import { chooseLanguage } from '../../lang/_INDEX.js';

export const sendSuccess = ({
  res,
  message = 'Success',
  messageCode,
  lang,
  data = undefined,
  statusCode = 200,
  ...extra
} = {}) => {
  return res.status(statusCode).json({
    success: true,
    message: messageCode === undefined ? message : chooseLanguage({ lang, code: messageCode }),
    data,
    ...extra,
  });
};