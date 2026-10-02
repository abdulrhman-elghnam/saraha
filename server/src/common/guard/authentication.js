import { TokenTypeEnum } from '#/common/value/enum.js';
import { UnauthorizedException } from '#/common/exception/error.js';
import { decodeToken } from '#/common/security/token.js';

export const authenticationGuard = ({ tokenType = TokenTypeEnum.ACCESS } = {}) => {
  return async (request, response, next) => {
    const authorization = request.headers.authorization;

    if (!authorization) {
      return UnauthorizedException({
        messageCode: 306,
      });
    }
    const { user, payload } = await decodeToken({ authorization, tokenType });

    request.user = user;
    request.payload = payload;
    next();
  };
};
