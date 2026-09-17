import { UnauthorizedException } from '#/common/_index.js';
import { TokenType } from '#/common/enum/enum.js';
import { decodeToken } from '#/common/jwt/decode.js';

export const authenticationGuard = ({tokenType = TokenType.ACCESS_TOKEN }) => {
  
  return async (request, response, next) => {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      return UnauthorizedException({
        message: 'No token provided',
      });
    }
    const user = await decodeToken({ authorization: authHeader , TokenType : tokenType });
    request.user = user;
    next();
  }
}
