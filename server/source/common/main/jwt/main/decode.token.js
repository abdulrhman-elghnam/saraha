import { findById, UserModel } from '#/database/index.js';
import { BadRequestException, NotFoundException } from './../../exception/index.js';
import { verifyToken } from './verify.token.js';

export const decodeToken = async ({ authorization = '' } = {}) => {
  const payload = verifyToken({ token: authorization });

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
