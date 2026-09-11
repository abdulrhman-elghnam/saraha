import jwt from 'jsonwebtoken';
import { config } from '../../../../../configuration';

export const generateToken = ({payload , exp="15m"  }) => {
  return jwt.sign(
    payload,
    config.JWT_SECRET_KEY,
    {
      expiresIn : exp ,
    }
  );
};