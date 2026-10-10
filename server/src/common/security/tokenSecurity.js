
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '#/common/exception/_INDEX.js';

import { TokenTypeEnum, SystemRoleEnum } from '#/common/value/_INDEX.js';

import {
  ACCESS_ADMIN_TOKEN_SECRET,
  ACCESS_ADMIN_TOKEN_EXPIRY,
  ACCESS_USER_TOKEN_SECRET,
  ACCESS_USER_TOKEN_EXPIRY,
  REFRESH_SYSTEM_TOKEN_SECRET,
  REFRESH_SYSTEM_TOKEN_EXPIRY,
} from '#/core/config/configEnv.js';

import {
  setCache,
  UserModel,
  findById,
  cacheExists,
} from '#/core/_EXPORT.js';

import { getRevokedTokenKey } from '#/core/database/redis/keyCache.js';
import { randomUUID } from 'node:crypto';
import jwt from 'jsonwebtoken';

export const createToken = ({
  payload = {},
  options = {},
  secret = ACCESS_USER_TOKEN_SECRET,
} = {}) => {
  return jwt.sign(payload, secret, {
    ...options,
    jwtid: randomUUID(),
  });
};

export const verifyToken = ({
  token,
  secret = ACCESS_USER_TOKEN_SECRET,
} = {}) => {
  return jwt.verify(token, secret);
};

export const getTokenExpiration = ({ token } = {}) => {
  if (typeof token !== 'string') {
    throw BadRequestException({ messageCode: 302 });
  }

  const [, payload] = token.split('.');

  if (!payload) {
    throw BadRequestException({ messageCode: 302 });
  }

  let decodedPayload;

  try {
    decodedPayload = JSON.parse(
      Buffer.from(payload, 'base64url').toString(),
    );
  } catch {
    throw BadRequestException({ messageCode: 302 });
  }

  if (!decodedPayload?.exp) {
    throw BadRequestException({ messageCode: 302 });
  }

  return decodedPayload.exp * 1000;
};

export const getTokenSignature = ({
  role = SystemRoleEnum.USER,
  tokenType = TokenTypeEnum.ACCESS,
} = {}) => {
  if (tokenType === TokenTypeEnum.REFRESH) {
    return REFRESH_SYSTEM_TOKEN_SECRET;
  }

  switch (role) {
    case SystemRoleEnum.ADMIN:
      return ACCESS_ADMIN_TOKEN_SECRET;

    case SystemRoleEnum.USER:
      return ACCESS_USER_TOKEN_SECRET;

    default:
      throw BadRequestException({ messageCode: 317 });
  }
};

export const getTokenExpiry = ({
  role = SystemRoleEnum.USER,
  tokenType = TokenTypeEnum.ACCESS,
} = {}) => {
  if (tokenType === TokenTypeEnum.REFRESH) {
    return REFRESH_SYSTEM_TOKEN_EXPIRY;
  }

  switch (role) {
    case SystemRoleEnum.ADMIN:
      return ACCESS_ADMIN_TOKEN_EXPIRY;

    case SystemRoleEnum.USER:
      return ACCESS_USER_TOKEN_EXPIRY;

    default:
      throw BadRequestException({ messageCode: 317 });
  }
};

export const getToken = (authorization) => {
  if (!authorization) {
    throw BadRequestException({ messageCode: 306 });
  }

  if (typeof authorization !== 'string') {
    throw BadRequestException({ messageCode: 308 });
  }

  const [type, token, ...extra] = authorization.trim().split(/\s+/);

  if (type !== 'Bearer' || !token || extra.length > 0) {
    throw BadRequestException({ messageCode: 308 });
  }

  return token;
};

export const setCacheToken = async ({
  accessToken,
  refreshToken,
  role,
} = {}) => {
  const accessPayload = verifyToken({
    token: accessToken,
    secret: getTokenSignature({
      role,
      tokenType: TokenTypeEnum.ACCESS,
    }),
  });

  const refreshPayload = verifyToken({
    token: refreshToken,
    secret: getTokenSignature({
      role,
      tokenType: TokenTypeEnum.REFRESH,
    }),
  });

  if (
    !accessPayload.sub ||
    !accessPayload.jti ||
    !refreshPayload.sub ||
    !refreshPayload.jti
  ) {
    throw BadRequestException({ messageCode: 302 });
  }

  await setCache({
    key: getRevokedTokenKey({
      sub: accessPayload.sub,
      jti: accessPayload.jti,
    }),
    value: accessPayload.jti,
    options: {
      EX: getTokenExpiry({
        role,
        tokenType: TokenTypeEnum.ACCESS,
      }),
    },
  });

  await setCache({
    key: getRevokedTokenKey({
      sub: refreshPayload.sub,
      jti: refreshPayload.jti,
    }),
    value: refreshPayload.jti,
    options: {
      EX: getTokenExpiry({
        role,
        tokenType: TokenTypeEnum.REFRESH,
      }),
    },
  });
};

export const revokeToken = async ({ payload } = {}) => {
  if (!payload?.sub || !payload?.jti || !payload?.exp) {
    throw BadRequestException({ messageCode: 302 });
  }

  const ttl = payload.exp - Math.floor(Date.now() / 1000);

  if (ttl <= 0) {
    return;
  }

  await setCache({
    key: getRevokedTokenKey({
      sub: payload.sub,
      jti: payload.jti,
    }),
    value: payload.jti,
    options: { EX: ttl },
  });
};

export const decodeToken = async ({
  authorization,
  tokenType = TokenTypeEnum.ACCESS,
} = {}) => {
  const token = getToken(authorization);
  const decoded = jwt.decode(token);

  if (!decoded || typeof decoded !== 'object') {
    throw UnauthorizedException({ messageCode: 302 });
  }

  const role = decoded.aud;

  if (
    role !== SystemRoleEnum.USER &&
    role !== SystemRoleEnum.ADMIN
  ) {
    throw UnauthorizedException({ messageCode: 317 });
  }

  let payload;

  try {
    payload = verifyToken({
      token,
      secret: getTokenSignature({ role, tokenType }),
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw UnauthorizedException({ messageCode: 303 });
    }

    if (error.name === 'JsonWebTokenError') {
      throw UnauthorizedException({ messageCode: 302 });
    }

    throw error;
  }

  if (!payload?.sub || !payload?.jti) {
    throw UnauthorizedException({ messageCode: 302 });
  }

  const tokenExists = await cacheExists({
    key: getRevokedTokenKey({
      sub: payload.sub,
      jti: payload.jti,
    }),
  });

  if (!tokenExists) {
    throw UnauthorizedException({ messageCode: 302 });
  }

  const user = await findById({
    model: UserModel,
    id: payload.sub,
  });

  if (!user) {
    throw NotFoundException({ messageCode: 401 });
  }

  if (user.role !== payload.aud) {
    throw UnauthorizedException({ messageCode: 317 });
  }

  return {
    user,
    payload,
  };
};
