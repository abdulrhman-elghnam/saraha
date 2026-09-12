
import { ForbiddenException, UnauthorizedException } from '#/common/index.js';
import { config } from '#/configuration/index.js';

import jwt from 'jsonwebtoken';

export const authenticationGuard = (request, response, next) => {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    return UnauthorizedException({
      message: 'No token provided',
    });
  }

  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return UnauthorizedException({
      message: 'Invalid authorization format',
    });
  }

  jwt.verify(token, config.JWT_SECRET_KEY, (err, decoded) => {
    if (err) {
      return ForbiddenException({
        message: 'Invalid or expired token',
      });
    }

    request.user = decoded;
    next();
  });
};