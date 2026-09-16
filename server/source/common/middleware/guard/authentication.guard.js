import { UnauthorizedException } from '#/common/_index.js';
import { decodeToken } from '#/common/jwt/decode.js';

export const authenticationGuard = async (request, response, next) => {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    return UnauthorizedException({
      message: 'No token provided',
    });
  }
  const user = await decodeToken({ authorization: authHeader });

  request.user = user;
  next();
};
