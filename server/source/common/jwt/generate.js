import jwt from 'jsonwebtoken';
import { config } from '#/configuration/configuration.js';

export const generateToken = ({
  payload = {},
  options = {},
  secret = config.ACCESS_USER_TOKEN_SECRET,
  expiresIn = config.ACCESS_USER_TOKEN_SECRET,
} = {}) => {  
  return jwt.sign(payload, secret, {
    ...options,
    expiresIn,
  });
};

