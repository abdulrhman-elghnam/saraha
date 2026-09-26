import { UnauthorizedException } from '#/common/_index.js';

export const authorizationGuard = ({ role = [] } = {}) => {
  return (request, response, next) => {
    if (!request.user) {
      throw UnauthorizedException({
        messageCode: 109,
      });
    }
    if (role.length && !role.includes(request.user.role)) {
      throw UnauthorizedException({
        messageCode: 109,
      });
    }
    next();
  };
};
