import { ForbiddenException, UnauthorizedException } from '#/common/index.js';

import jwt from 'jsonwebtoken';

export const authenticationGuard = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return UnauthorizedException({ message: 'No token provided' });

  const token = authHeader.split(' ')[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return ForbiddenException({ message: 'Invalid or expired token' });
    req.user = decoded;
    next();
  });
};
