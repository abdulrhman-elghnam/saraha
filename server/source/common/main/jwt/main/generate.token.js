import jwt from 'jsonwebtoken';
import { config } from '#/configuration/main/configuration.js';

export const generateAccessToken = ({
  payload = {},
  options = {},
  secret = config.ACCESS_TOKEN_SECRET,
  expiresIn = config.ACCESS_TOKEN_EXPIRY,
} = {}) => {
  return jwt.sign(payload, secret, {
    ...options,
    expiresIn,
  });
};

export const generateRefreshToken = ({
  payload = {},
  options = {},
  secret = config.REFRESH_TOKEN_SECRET,
  expiresIn = config.REFRESH_TOKEN_EXPIRY,
} = {}) => {
  return jwt.sign(payload, secret, {
    ...options,
    expiresIn,
  });
};
