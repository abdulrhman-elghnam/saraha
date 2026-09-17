import { config } from '#/configuration/configuration.js';

export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export const globalErrorHandling = (error, request, response, next) => {
  const status = error.cause?.status ?? 500;
  const isProduction = config.ENV === 'production';
  const defaultErrorMessage = 'Something went wrong';

  const displayErrorMessage = error.message || defaultErrorMessage;

  return response.status(status).json({
    success: false,
    status,
    message: isProduction && status === 500 ? 'Internal Server Error' : displayErrorMessage,
    ...(isProduction ? {} : { stack: error.stack, cause: error.cause, extra: error.extra }),
  });
};
