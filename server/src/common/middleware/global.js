import { ENV } from '#/core/config/config.js';
import { acceptLanguage } from '../util/util.js';
import { ApiLanguageEnum } from '../value/enum.js';
import { chooseLanguage } from '../lang/lang.js';

export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export const globalErrorHandling = (error, request, response, next) => {
  const status = error.cause?.status ?? 500;

  const message = chooseLanguage({
    Language: acceptLanguage({ req }),
    code: error.cause?.messageCode ?? 103,
  });
  
  const isProduction = ENV === 'prod';

  return response.status(status).json({
    success: false,
    status,
    message,
    ...(isProduction ? {} : { stack: error.stack, cause: error.cause, extra: error.extra }),
  });
};
