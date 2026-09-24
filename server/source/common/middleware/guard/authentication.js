import { TokenTypeEnum, UnauthorizedException } from '#/common/_index.js';
import { decodeToken } from '#/common/security/jwt/token.js';

export const authenticationGuard = ({ tokenType = TokenTypeEnum.ACCESS } = {}) => {
  return async (request, response, next) => {
    const authorization = request.headers.authorization;

    if (!authorization) {
      return UnauthorizedException({
        message: 'No token provided',
      });
    }
    const { user, payload } = await decodeToken({ authorization, tokenType });

    request.user = user;
    request.payload = payload;
    next();
  };
};
