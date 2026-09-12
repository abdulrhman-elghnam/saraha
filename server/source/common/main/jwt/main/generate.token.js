import { config } from '#/configuration/main/configuration.js';
import jwt from 'jsonwebtoken';


export const generateToken = ({ payload, exp = '15m' } = {}) => {
  return jwt.sign(payload, config.JWT_SECRET_KEY, {
    expiresIn: exp,
  });
};
