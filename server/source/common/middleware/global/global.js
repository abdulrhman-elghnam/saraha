import { ENV } from '#/configuration/configuration.js';
import { acceptLanguage } from '../../_index.js';
import { ApiLanguageEnum } from '../../enum/_index.js';
import { chooseLanguage } from '../../i18n/_index.js';

export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export const globalErrorHandling = (error, request, response, next) => {
  const status = error.cause?.status ?? 500;
  const statusMessageCodes = {
    400: 108,
    401: 109,
    403: 110,
    404: 111,
    409: 112,
    422: 113,
    429: 114,
    500: 115,
    503: 116,
  };
  const message = chooseLanguage({
    Language: acceptLanguage({ request }),
    code: error.cause?.messageCode ?? statusMessageCodes[status] ?? 103,
  });
  const isProduction = ENV === 'production';

  return response.status(status).json({
    success: false,
    status,
    message,
    ...(isProduction ? {} : { stack: error.stack, cause: error.cause, extra: error.extra }),
  });
};
