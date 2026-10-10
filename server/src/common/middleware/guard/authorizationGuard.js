import { UnauthorizedException } from '#/common/_EXPORT.js';

export const authorizationGuard = ({ role = [] } = {}) => {
  return (req, res, next) => {
    if (!req.user) {
      throw UnauthorizedException({
        messageCode: 109,
      });
    }
    if (role.length && !role.includes(req.user.role)) {
      throw UnauthorizedException({
        messageCode: 109,
      });
    }
    next();
  };
};
