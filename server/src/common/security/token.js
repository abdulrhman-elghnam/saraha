import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '#/common/exception/error.js';
import {
  TokenTypeEnum,
  SystemRoleEnum,
} from '#/common/value/enum.js';

import {
  ACCESS_ADMIN_TOKEN_SECRET,
  ACCESS_ADMIN_TOKEN_EXPIRY,
  ACCESS_USER_TOKEN_SECRET,
  ACCESS_USER_TOKEN_EXPIRY,
  REFRESH_SYSTEM_TOKEN_SECRET,
  REFRESH_SYSTEM_TOKEN_EXPIRY,
} from '#/core/config/config.js';

import { getCache, setCache } from '#/core/db/cache/cache.js';
import { UserModel } from '#/core/db/model/user.model.js';
import { findById } from '#/core/db/repo/repo.js';
import { randomUUID } from 'node:crypto';
import jwt from 'jsonwebtoken';

export const createToken = ({
  payload = {},
  options = {},
  secret = ACCESS_USER_TOKEN_SECRET,
} = {}) => {
  const jwtid = randomUUID();
  return jwt.sign(payload, secret, {
    ...options,
    jwtid,
  });
};

export const verifyToken = ({ token, secret = ACCESS_USER_TOKEN_SECRET } = {}) => {
  return jwt.verify(token, secret);
};

export const getTokenExpiration = ({ token }) => {
  const [, payload] = token.split('.');

  if (!payload) {
    throw BadRequestException({
      messageCode: 302,
    });
  }

  let decodedPayload;

  try {
    decodedPayload = JSON.parse(Buffer.from(payload, 'base64url').toString());
  } catch {
    throw BadRequestException({
      messageCode: 302,
    });
  }

  if (!decodedPayload?.exp) {
    throw BadRequestException({
      messageCode: 302,
    });
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
      throw BadRequestException({
        messageCode: 317,
      });
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
      throw BadRequestException({
        messageCode: 317,
      });
  }
};

export const getToken = (authorization) => {
  if (!authorization) {
    throw BadRequestException({
      messageCode: 306,
    });
  }

  const [type, token] = authorization.split(' ');

  if (type !== 'Bearer' || !token) {
    throw BadRequestException({
      messageCode: 308,
    });
  }

  return token;
};

export const createLoginCredential = ({ id, role = SystemRoleEnum.USER, iss }) => {
  const sessionId = randomUUID();
  const sessionExp = Math.floor(Date.now() / 1000) + REFRESH_SYSTEM_TOKEN_EXPIRY;

  const accessToken = createToken({
    payload: {
      sub: id,
      aud: role,
      issuer: iss,
      sid: sessionId,
      sessionExp,
    },

    secret: getTokenSignature({
      role,
      tokenType: TokenTypeEnum.ACCESS,
    }),

    options: {
      expiresIn: getTokenExpiry({
        role,
        tokenType: TokenTypeEnum.ACCESS,
      }),
    },
  });

  const refreshToken = createToken({
    payload: {
      sub: id,
      aud: role,
      sid: sessionId,
      sessionExp,
    },

    secret: getTokenSignature({
      role,
      tokenType: TokenTypeEnum.REFRESH,
    }),

    options: {
      expiresIn: getTokenExpiry({
        role,
        tokenType: TokenTypeEnum.REFRESH,
      }),
    },
  });

  return {
    accessToken,
    refreshToken,
  };
};

const getRevokedTokenKey = ({ sub, jti, sid }) =>
  `USER::${sub}::REVOKE-TOKEN::${sid || jti}`;

export const revokeToken = async ({ payload } = {}) => {
  if (!payload?.sub || !payload?.jti || !payload?.exp) {
    throw BadRequestException({
      messageCode: 302,
    });
  }

  const ttl = Math.ceil((payload.sessionExp || payload.exp) - Date.now() / 1000);
  if (ttl <= 0) return;

  await setCache({
    key: getRevokedTokenKey(payload),
    value: payload.jti,
    options: { EX: ttl },
  });
};

export const decodeToken = async ({ authorization, tokenType = TokenTypeEnum.ACCESS } = {}) => {
  const token = getToken(authorization);

  const decoded = jwt.decode(token);

  if (!decoded || typeof decoded !== 'object') {
    throw BadRequestException({
      messageCode: 302,
    });
  }

  const role = decoded.aud;

  if (role !== SystemRoleEnum.USER && role !== SystemRoleEnum.ADMIN) {
    throw BadRequestException({
      messageCode: 317,
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
        messageCode: 303,
      });
    }

    if (error.name === 'JsonWebTokenError') {
      throw UnauthorizedException({
        messageCode: 302,
      });
    }

    throw error;
  }

  if (!payload?.sub) {
    throw BadRequestException({
      messageCode: 302,
    });
  }

  if (await getCache({ key: getRevokedTokenKey(payload) })) {
    throw UnauthorizedException({
      messageCode: 302,
    });
  }

  const user = await findById({
    model: UserModel,
    id: payload.sub,
  });

  if (!user) {
    throw NotFoundException({
      messageCode: 401,
    });
  }

  if (user.role !== payload.aud) {
    throw UnauthorizedException({
      messageCode: 317,
    });
  }

  return {
    user,
    payload,
  };
};
