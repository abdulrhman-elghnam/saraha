import {
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '#/common/exception/error.js';
import { encrypt } from '#/common/security/encryption.js';
import { hash, compare } from '#/common/security/hash.js';
import { createLoginCredential, getTokenExpiration, revokeToken } from '#/common/security/token.js';
import { ProviderEnum } from '../../common/value/enum.js';
import { OAUTH_GOOGLE_CLIENT_ID } from '#/core/config/config.js';
import { create, findOne } from '#/core/db/repo/repo.js';
import { UserModel } from '#/core/db/model/user.model.js';
import { OAuth2Client } from 'google-auth-library';
import { asyncHandler } from '#/common/util/util.js';

const client = new OAuth2Client();

async function verifyGoogleAccount(idToken) {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: OAUTH_GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();

  if (!payload?.email_verified || !payload.email || !payload.sub) {
    throw BadRequestException({ messageCode: 301 });
  }
  return {
    googleId: payload.sub,
    name: payload.name,
    email: payload.email.toLowerCase(),
    picture: payload.picture,
  };
}

export const signUp = asyncHandler(async ({ fullName, gender, username, email, phoneNumber, password, DOB }) => {
  const isFind = await findOne({
    filter: { $or: [{ email }, { username }] },
    select: '-_id',
    model: UserModel,
  });

  if (isFind) ConflictException({ messageCode: 402 });

  await create({
    data: {
      fullName,
      username,
      email,
      gender,
      phoneNumber: encrypt(phoneNumber),
      password: await hash(password),
      DOB: new Date(DOB),
    },
    model: UserModel,
    options: {
      lean: true,
    },
  });
  return { messageCode: 104, statusCode: 201 };
})

export const signUpWithGoogle = asyncHandler(async ({ idToken } = {}, iss) => {

  const payload = await verifyGoogleAccount(idToken);

  const isExist = await findOne({
    model: UserModel,
    filter: { email: payload.email },
  });

  if (isExist) {
    if (isExist.provider !== ProviderEnum.GOOGLE) {
      throw ConflictException({
        messageCode: 301,
      });
    }

    const { accessToken, refreshToken } = createLoginCredential({
      id: isExist.id,
      role: isExist.role,
      iss,
    });

    return {
      messageCode: 309,
      statusCode: 200,
      accessToken,
      refreshToken,
    };
  }

  const nameParts = (payload.name || payload.email.split('@')[0]).trim().split(/\s+/);
  const usernameBase =
    payload.email
      .split('@')[0]
      .replace(/[^a-zA-Z0-9_]/g, '')
      .slice(0, 20) || 'user';
  const username = `${usernameBase}_${payload.googleId.slice(-8)}`.slice(0, 30);
  const [user] = await create({
    model: UserModel,
    data: {
      firstName: nameParts[0] || 'Google',
      lastName: nameParts.slice(1).join(' ') || 'User',
      username,
      email: payload.email,
      provider: ProviderEnum.GOOGLE,
      profileImage: payload.picture || null,
      DOB: new Date('1970-01-01'),
      phoneNumber: encrypt(`google:${payload.googleId}`),
      gender: 0,
    },
    options: { lean: true },
  });

  const { accessToken, refreshToken } = createLoginCredential({
    id: user.id || user._id.toString(),
    role: user.role,
  });

  return {
    messageCode: 104,
    statusCode: 201,
    accessToken,
    refreshToken,
  };
});

export const login = asyncHandler(async ({ email, password }, iss) => {
  const user = await findOne({
    filter: { email },
    model: UserModel,
  });

  if (!user) {
    throw NotFoundException({
      messageCode: 401,
    });
  }

  if (user.provider === ProviderEnum.GOOGLE) throw ConflictException({ messageCode: 301 });

  if (!(await compare(password, user.password))) {
    throw ConflictException({
      messageCode: 301,
    });
  }

  const { accessToken, refreshToken } = createLoginCredential({ id: user.id, role: user.role, iss });
  return {
    messageCode: 309,
    statusCode: 200,
    accessToken,
    refreshToken,
  };
});

export const profile = asyncHandler(async ({ firstName, lastName, username, DOB, phoneNumber, profileImage, coverImage }) => {
  return {
    messageCode: 127,
    statusCode: 200,
    data: { firstName, lastName, username, DOB, profileImage, coverImage },
  };
});

export const rotateToken = asyncHandler(async ({ expireToken } = {}, user, payload, iss) => {
  console.log(expireToken, user, payload, iss);

  if (!expireToken) {
    throw BadRequestException({
      messageCode: 311,
    });
  }

  const expiresAt = getTokenExpiration({ token: expireToken });

  if (expiresAt > Date.now()) {
    throw ConflictException({
      messageCode: 112,
    });
  }

  const { accessToken } = createLoginCredential({ id: user.id, role: user.role, iss });
  await revokeToken({ payload });
  return {
    accessToken,
    messageCode: 107,
  };
});

export const logout = asyncHandler(async (payload) => {
  return await revokeToken({ payload });
});
