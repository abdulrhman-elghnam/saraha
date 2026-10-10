import { acceptLanguage } from '../util/_INDEX.js';
import { chooseLanguage } from '../../lang/_INDEX.js';
import { ENV } from '../../core/config/_INDEX.js';

export const globalErrorHandler = (error, req, res, next) => {
  const isMulterError = error.name === 'MulterError';
  const status =
    error.cause?.status ??
    (isMulterError ? (error.code === 'LIMIT_FILE_SIZE' ? 413 : 400) : 500);

  const message = chooseLanguage({
    lang: acceptLanguage({ req }),
    code:
      error.cause?.messageCode ??
      (isMulterError ? (error.code === 'LIMIT_FILE_SIZE' ? 604 : 602) : 103),
  });

  const isProduction = ENV === 'prod';

  return res.status(status).json({
    success: false,
    status,
    message,
    ...(isProduction ? {} : { stack: error.stack, cause: error.cause, extra: error.extra }),
  });
};
