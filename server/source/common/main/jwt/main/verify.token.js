import { config } from '#/configuration/main/configuration.js';
import jwt from 'jsonwebtoken';

export const verifyToken = (token) => {
  return jwt.verify(token, config.JWT_SECRET_KEY );
};