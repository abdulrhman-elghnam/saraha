import {
  BadRequestException,
  NotFoundException,
  TokenType,
} from '#/common/_index.js';

import { config } from '#/configuration/_index.js';

import { findById, UserModel } from '#/database/_index.js';

import jwt from 'jsonwebtoken';

export const generateToken = ({
  payload = {},
  options = {},
  secret = config.ACCESS_USER_TOKEN_SECRET,
  expiresIn = config.ACCESS_USER_TOKEN_EXPIRY,
} = {}) => {
  return jwt.sign(payload, secret, {
    ...options,
    expiresIn,
  });
};

export const verifyToken = ({
  token = '',
  secret = config.ACCESS_USER_TOKEN_SECRET,
} = {}) => {
  return jwt.verify(token, secret);
};

export const getTokenExpiration = ({ token }) => {
  const [, payload] = token.split('.');

  if (!payload) {
    throw BadRequestException({
      message: 'invalid token',
    });
  }

  let decodedPayload;

  try {
    decodedPayload = JSON.parse(
      Buffer.from(payload, 'base64url').toString(),
    );
  } catch {
    throw BadRequestException({
      message: 'invalid token payload',
    });
  }

  if (!decodedPayload?.exp) {
    throw BadRequestException({
      message: 'token expiration is missing',
    });
  }

  return decodedPayload.exp * 1000;
};

export const getSignature = ({
  tokenType = TokenType.ACCESS,
} = {}) => {
  return tokenType === TokenType.ACCESS
    ? config.ACCESS_USER_TOKEN_SECRET
    : config.REFRESH_TOKEN_SECRET;
};

export const getToken = (authorization) => {
  if (!authorization) {
    throw BadRequestException({
      message: 'missing authorization token',
    });
  }

  const [type, token] = authorization.split(' ');

  if (type !== 'Bearer' || !token) {
    throw BadRequestException({
      message: 'invalid authorization format',
    });
  }

  return token;
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

  return {
    accessToken,
    refreshToken,
  };
};

export const rotateToken = async (user) => {
  return createLoginCredential({
    id: user.id,
  });
};

export const decodeToken = async ({
  authorization,
  tokenType = TokenType.ACCESS,
} = {}) => {
  const token = getToken(authorization);

  const payload = verifyToken({
    token,
    secret: getSignature({
      tokenType,
    }),
  });

  if (!payload?.sub) {
    throw BadRequestException({
      message: 'missing token payload',
    });
  }

  const user = await findById({
    model: UserModel,
    id: payload.sub,
  });

  if (!user) {
    throw NotFoundException({
      message: 'invalid user',
    });
  }

  return {
    user,
    payload,
  };
};
