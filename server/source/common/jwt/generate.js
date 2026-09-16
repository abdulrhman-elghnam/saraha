import jwt from 'jsonwebtoken';
import { config } from '#/configuration/configuration.js';

export const generateToken = ({
  payload = {},
  options = {},
  secret = "value",
  expiresIn = "1m" ,
} = {}) => {
  return jwt.sign(payload, secret, {
    ...options,
    expiresIn,
  });
};

