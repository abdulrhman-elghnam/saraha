import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  TokenType,
  SystemRole,
} from '#/common/_index.js';

import {
  ACCESS_ADMIN_TOKEN_SECRET,
  ACCESS_USER_TOKEN_EXPIRY,
  ACCESS_USER_TOKEN_SECRET,
  REFRESH_ADMIN_TOKEN_SECRET,
  REFRESH_TOKEN_EXPIRY,
  REFRESH_USER_TOKEN_SECRET,
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

export const verifyToken = ({
  token,
  secret = ACCESS_USER_TOKEN_SECRET,
} = {}) => {
  return jwt.verify(token, secret);
};

// export const getTokenExpiration = ({ token }) => {
//   const [, payload] = token.split('.');

//   if (!payload) {
//     throw BadRequestException({
//       message: 'invalid token',
//     });
//   }

//   let decodedPayload;

//   try {
//     decodedPayload = JSON.parse(
//       Buffer.from(payload, 'base64url').toString(),
//     );
//   } catch {
//     throw BadRequestException({
//       message: 'invalid token payload',
//     });
//   }

//   if (!decodedPayload?.exp) {
//     throw BadRequestException({
//       message: 'token expiration is missing',
//     });
//   }

//   return decodedPayload.exp * 1000;
// };

export const getTokenSignature = ({
  role = SystemRole.USER,
} = {}) => {
  switch (role) {
    case SystemRole.ADMIN:
      return {
        accessToken: ACCESS_ADMIN_TOKEN_SECRET,
        refreshToken: REFRESH_ADMIN_TOKEN_SECRET,
      };

    case SystemRole.USER:
      return {
        accessToken: ACCESS_USER_TOKEN_SECRET,
        refreshToken: REFRESH_USER_TOKEN_SECRET,
      };

    default:
      throw BadRequestException({
        message: 'invalid system role',
      });
  }
};

export const getSignatureAccessAndRefresh = ({
  role = SystemRole.USER,
  tokenType = TokenType.ACCESS,
} = {}) => {
  const signature = getTokenSignature({ role });

  return tokenType === TokenType.ACCESS
    ? signature.accessToken
    : signature.refreshToken;
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

export const createLoginCredential = ({
  id,
  role = SystemRole.USER,
}) => {
  const accessToken = createToken({
    payload: {
      sub: id,
      aud: role,
    },

    secret: getSignatureAccessAndRefresh({
      role,
      tokenType: TokenType.ACCESS,
    }),

    options: {
      expiresIn: ACCESS_USER_TOKEN_EXPIRY,
    },
  });

  const refreshToken = createToken({
    payload: {
      sub: id,
      aud: role,
    },

    secret: getSignature({
      role,
      tokenType: TokenType.REFRESH,
    }),

    options: {
      expiresIn: REFRESH_TOKEN_EXPIRY,
    },
  });

  return {
    accessToken,
    refreshToken,
  };
};

export const rotateToken = async (user) => {
  return createLoginCredential({
    id: user.id,
    role: user.role,
  });
};

export const decodeToken = async ({
  authorization,
  tokenType = TokenType.ACCESS,
} = {}) => {

  const token = getToken(authorization);  
  const decoded = jwt.decode(token);

  const role = decoded.aud;

  if (
    role !== SystemRole.USER &&
    role !== SystemRole.ADMIN
  ) {
    throw BadRequestException({
      message: 'invalid token role',
    });
  }

  let payload;

  try {
    payload = verifyToken({
      token,
      secret: getSignatureAccessAndRefresh({
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
