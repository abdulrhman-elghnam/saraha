import {
  ApiLanguageEnum,
  chooseLanguage,
  TokenTypeEnum,
  UnauthorizedException,
} from '#/common/_index.js';
import { decodeToken } from '#/common/security/jwt/token.js';

export const authenticationGuard = ({ tokenType = TokenTypeEnum.ACCESS } = {}) => {
  return async (request, response, next) => {
    const authorization = request.headers.authorization;
    if (!authorization) {
      return UnauthorizedException({
        message: chooseLanguage({ Language: lang ?? ApiLanguageEnum.ENGLISH, code: 129 }),
      });
    }
    const { user, payload } = await decodeToken({ authorization, tokenType });

    request.user = user;
    request.payload = payload;
    next();
  };
};
