import { UnauthorizedException } from '#/common/index.js';
import { decodeToken } from '#/common/main/jwt/main/decode.token.js';

export const authenticationGuard = async (request, response, next) => {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    return UnauthorizedException({
      message: 'No token provided',
    });
  }
  const user = await decodeToken({ authorization: authHeader });
  console.log(user);

  request.user = user;
  next();
};
