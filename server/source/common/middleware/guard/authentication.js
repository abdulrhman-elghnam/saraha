import { UnauthorizedException } from '#/common/_index.js';
import { decodeToken } from '#/common/security/jwt/token.js';

export const authenticationGuard = () => {
  return async (request, response, next) => {
    const authorization = request.headers.authorization;

    if (!authorization) {
      return UnauthorizedException({
        message: 'No token provided',
      });
    }
    const user = await decodeToken({ authorization });
    request.user = user;
    next();
  };
};
