import { BadRequestException, NotFoundException, TokenType } from '#/common/_index.js';
import { config } from '#/configuration/_index.js';
import { findById, UserModel } from '#/database/_index.js';
import jwt from 'jsonwebtoken';

export const generateToken = ({
  payload = {},
  options = {},
  secret = config.ACCESS_USER_TOKEN_SECRET,
  expiresIn = config.ACCESS_USER_TOKEN_SECRET,
} = {}) => {
  return jwt.sign(payload, secret, {
    ...options,
    expiresIn,
  });
};

export const verifyToken = ({ token = '', secret = config.ACCESS_USER_TOKEN_SECRET } = {}) => {
  return jwt.verify(token, secret);
};

export const getSignature = ({ tokenType = TokenType.ACCESS }) =>
  tokenType == TokenType.ACCESS ? config.ACCESS_USER_TOKEN_SECRET : config.REFRESH_TOKEN_SECRET;

export const getTokenSignature = () => {};

export const decodeToken = async ({ authorization, tokenType = TokenType.ACCESS } = {}) => {
  const payload = verifyToken({ token: authorization, tokenType });

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
