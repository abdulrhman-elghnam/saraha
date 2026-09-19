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

// layer that ignore refresh token
export const getSignature = ({ tokenType = TokenType.ACCESS }) =>
  tokenType == TokenType.ACCESS ? config.ACCESS_USER_TOKEN_SECRET : config.REFRESH_TOKEN_SECRET;

export const getTokenSignature = () => {};

export const decodeToken = async ({ authorization, tokenType = TokenType.ACCESS } = {}) => {
  const payload = verifyToken({ token: authorization, secret: getSignature({ tokenType }) });

  if (!payload?.sub) {
    throw BadRequestException({ message: 'missing token payload' });
  }
  const user = await findById({
    model: UserModel,
    id: payload.sub,
  });
  if (!user) {
    throw NotFoundException({ message: 'invalid user' });
  }
  return { user, payload };
};

export const createLoginCredential = ({ id }) => {
  const accessToken = generateToken({
    payload: {
      sub: id,
    },
    secret: config.ACCESS_USER_TOKEN_SECRET,
    expiresIn: config.ACCESS_USER_TOKEN_EXPIRY,
  });

  const refreshToken = generateToken({
    payload: {
      sub: id,
    },
    secret: config.REFRESH_TOKEN_SECRET,
    expiresIn: config.REFRESH_TOKEN_EXPIRY,
  });

  return { accessToken, refreshToken };
};
