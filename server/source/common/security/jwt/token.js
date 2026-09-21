import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  TokenType,
  SystemRole,
} from '#/common/_index.js';

import {
  ACCESS_ADMIN_TOKEN_SECRET,
  ACCESS_ADMIN_TOKEN_EXPIRY,
  ACCESS_USER_TOKEN_SECRET,
  ACCESS_USER_TOKEN_EXPIRY,
  REFRESH_SYSTEM_TOKEN_SECRET,
  REFRESH_SYSTEM_TOKEN_EXPIRY,
} from '#/configuration/_index.js';

import { findById, UserModel } from '#/database/_index.js';

import jwt from 'jsonwebtoken';

export const createToken = ({
  payload = {},
  options = {},
  secret = ACCESS_USER_TOKEN_SECRET,
} = {}) => {
  return jwt.sign(payload, secret, {
    ...options,
  });
};

export const verifyToken = ({ token, secret = ACCESS_USER_TOKEN_SECRET } = {}) => {
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
    decodedPayload = JSON.parse(Buffer.from(payload, 'base64url').toString());
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

export const getTokenSignature = ({
  role = SystemRole.USER,
  tokenType = TokenType.ACCESS,
} = {}) => {
  if (tokenType === TokenType.REFRESH) {
    return REFRESH_SYSTEM_TOKEN_SECRET;
  }

  switch (role) {
    case SystemRole.ADMIN:
      return ACCESS_ADMIN_TOKEN_SECRET;

    case SystemRole.USER:
      return ACCESS_USER_TOKEN_SECRET;

    default:
      throw BadRequestException({
        message: 'invalid system role',
      });
  }
};

export const getTokenExpiry = ({ role = SystemRole.USER, tokenType = TokenType.ACCESS } = {}) => {
  if (tokenType === TokenType.REFRESH) {
    return REFRESH_SYSTEM_TOKEN_EXPIRY;
  }

  switch (role) {
    case SystemRole.ADMIN:
      return ACCESS_ADMIN_TOKEN_EXPIRY;

    case SystemRole.USER:
      return ACCESS_USER_TOKEN_EXPIRY;

    default:
      throw BadRequestException({
        message: 'invalid system role',
      });
  }
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

export const createLoginCredential = ({ id, role = SystemRole.USER }) => {
  const accessToken = createToken({
    payload: {
      sub: id,
      aud: role,
    },

    secret: getTokenSignature({
      role,
      tokenType: TokenType.ACCESS,
    }),

    options: {
      expiresIn: getTokenExpiry({
        role,
        tokenType: TokenType.ACCESS,
      }),
    },
  });

  const refreshToken = createToken({
    payload: {
      sub: id,
      aud: role,
    },

    secret: getTokenSignature({
      role,
      tokenType: TokenType.REFRESH,
    }),

    options: {
      expiresIn: getTokenExpiry({
        role,
        tokenType: TokenType.REFRESH,
      }),
    },
  });

  return {
    accessToken,
    refreshToken,
  };
};

export const decodeToken = async ({ authorization, tokenType = TokenType.ACCESS } = {}) => {
  const token = getToken(authorization);

  const decoded = jwt.decode(token);

  if (!decoded || typeof decoded !== 'object') {
    throw BadRequestException({
      message: 'invalid token',
    });
  }

  const role = decoded.aud;

  if (role !== SystemRole.USER && role !== SystemRole.ADMIN) {
    throw BadRequestException({
      message: 'invalid token role',
    });
  }

  let payload;

  try {
    payload = verifyToken({
      token,
      secret: getTokenSignature({
        role,
        tokenType,
      }),
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw UnauthorizedException({
        message: 'token expired',
      });
    }

    if (error.name === 'JsonWebTokenError') {
      throw UnauthorizedException({
        message: 'invalid token signature',
      });
    }

    throw error;
  }

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

  if (user.role !== payload.aud) {
    throw UnauthorizedException({
      message: 'token role does not match user role',
    });
  }

  return {
    user,
    payload,
  };
};
