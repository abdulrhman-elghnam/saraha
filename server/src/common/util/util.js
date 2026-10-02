import mongoose from 'mongoose';
import { ApiLanguageEnum } from '../value/enum.js';
import { chooseLanguage } from '../lang/lang.js';
import { ENV } from '#/core/config/config.js';

export const toObjectId = (id) => new mongoose.Types.ObjectId(id);

export const issuer = ({ req } = {}) => `${req.protocol}://${req.host}`;

export const acceptLanguage = ({ req } = {}) =>
  req.headers['accept-language'] ?? ApiLanguageEnum.ENGLISH;

export const asyncHandler = (fn) => {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      throw error;
    }
  };
};

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
    message:
      messageCode === undefined
        ? message
        : chooseLanguage({ lang, code: messageCode }),
    data,
    ...extra,
  });
};


export const globalErrorHandling = (error, req, res, next) => {
  const status = error.cause?.status ?? 500;

  const message = chooseLanguage({
    Language: acceptLanguage({ req }),
    code: error.cause?.messageCode ?? 103,
  });
  
  const isProduction = ENV === 'prod';

  return res.status(status).json({
    success: false,
    status,
    message,
    ...(isProduction ? {} : { stack: error.stack, cause: error.cause, extra: error.extra }),
  });
};
