import { config } from '../../../../../../../configuration/index.js';
export const globalErrorHandling = (error, req, res, next) => {
  const status = error.cause?.status ?? 500;
  const isProduction = config.ENV === 'production';
  const defaultErrorMessage = 'Something went wrong';

  const displayErrorMessage = error.message || defaultErrorMessage;

  return res.status(status).json({
    success: false,
    status,
    message: isProduction && status === 500 ? 'Internal Server Error' : displayErrorMessage,
    ...(isProduction ? {} : { stack: error.stack, cause: error.cause, extra: error.extra }),
  });
};
