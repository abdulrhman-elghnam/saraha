import { TokenTypeEnum, UnauthorizedException } from '#/common/_EXPORT.js';
import { decodeToken } from '#/common/security/_INDEX.js';


export const authenticationGuard = ({ tokenType = TokenTypeEnum.ACCESS } = {}) => {
  return async (req, res, next) => {
    const authorization = req.headers.authorization;
    
    if (!authorization) {
      return UnauthorizedException({
        messageCode: 306,
      });
    }
    
    const { user, payload } = await decodeToken({ authorization, tokenType });

    req.user = user;
    req.payload = payload;
    next();
  };
};
