import { createToken, getTokenExpiry, getTokenSignature, setCacheToken } from '../tokenSecurity.js';
import { SystemRoleEnum, TokenTypeEnum } from '#/common/_EXPORT.js';
import { getUserProfileCache, setCache } from '#/core/_EXPORT.js';

export const createLoginCredential = async ({ id, role = SystemRoleEnum.USER, iss , user }) => {
  const accessToken = createToken({
    payload: {
      sub: id,
      aud: role,
      issuer: iss,
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
      issuer: iss,
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

  if (user) {
     await setCache({key:getUserProfileCache(user._id.toString()),value: user})
  }
  await setCacheToken({ accessToken, refreshToken, role });

  
  return {
    accessToken,
    refreshToken,
  };
};
