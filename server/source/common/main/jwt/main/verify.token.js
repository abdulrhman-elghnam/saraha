import { config } from '#/configuration/main/configuration.js';
import jwt from 'jsonwebtoken';

export const verifyToken = ({ token = '', secret = config.ACCESS_TOKEN_SECRET } = {}) => {
  return jwt.verify(token, secret);
};
