import { findById, UserModel } from '#/database/_index.js';
import { TokenType } from '../enum/enum.js';
import { BadRequestException, NotFoundException } from '../exception/_index.js';
import { verifyToken } from './verify.js';

export const decodeToken = async ({ authorization , tokenType = TokenType.ACCESS } = {}) => {
  const payload = verifyToken({ token: authorization , tokenType  });
  
  if (!payload?.sub) {
    throw BadRequestException({ message: 'missing token payload' });
  }
  const account = await findById({
    model: UserModel,
    id: payload.sub,
  });
  if (!account) {
    throw NotFoundException({ message: 'invalid account' });
  }
  return account;
};
