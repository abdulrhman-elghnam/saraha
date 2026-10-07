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
import { randomInt } from 'node:crypto';
import { sendEmailOtp } from '#/common/email/email.js';
import {
  deleteCache,
  expireCache,
  getCache,
  incrementCache,
  setCache,
} from '#/core/db/cache/cache.js';
import { updateOne } from '#/core/db/repo/repo.js';
import { emailOtpAttemptKey, emailOtpKey } from '#/core/db/cache/key.js';

const client = new OAuth2Client();
const EMAIL_OTP_TTL_SECONDS = 120;
const EMAIL_OTP_MAX_ATTEMPTS = 5;

const issueEmailOtp = async ({ email, purpose }) => {
  const otp = String(randomInt(100000, 1000000));
  const key = emailOtpKey(email, purpose);

  await setCache({
    key,
    value: await hash(otp),
    options: { EX: EMAIL_OTP_TTL_SECONDS },
  });
  await deleteCache({ key: emailOtpAttemptKey(email, purpose) });
  await sendEmailOtp({ email, otp, purpose });
};

const verifyEmailOtp = async ({ email, otp, purpose }) => {
  const key = emailOtpKey(email, purpose);
  const attemptKey = emailOtpAttemptKey(email, purpose);
  const hashedOtp = await getCache({ key });

  if (!hashedOtp) {
    throw BadRequestException({ messageCode: purpose === 'password-reset' ? 708 : 702 });
  }

  const attempts = Number(await getCache({ key: attemptKey })) || 0;
  if (attempts >= EMAIL_OTP_MAX_ATTEMPTS) {
    await deleteCache({ key });
    await deleteCache({ key: attemptKey });
    throw BadRequestException({ messageCode: 701 });
  }

  const currentAttempts = await incrementCache({ key: attemptKey });
  if (currentAttempts === 1) {
    await expireCache({ key: attemptKey, seconds: EMAIL_OTP_TTL_SECONDS });
  }

  if (!(await compare(otp, hashedOtp))) {
    throw BadRequestException({ messageCode: 701 });
  }

  await deleteCache({ key });
  await deleteCache({ key: attemptKey });
};

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

export const signUp = asyncHandler(
  async ({ fullName, gender, username, email, phoneNumber, password, DOB }) => {
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
        emailVerifiedAt: null,
      },
      model: UserModel,
      options: {
        lean: true,
      },
    });
    await issueEmailOtp({ email, purpose: 'email-verification' });
    return { messageCode: 704, statusCode: 201 };
  }
);

export const resendEmailOtp = asyncHandler(async ({ email }) => {
  const user = await findOne({ filter: { email }, model: UserModel });
  if (user && !user.emailVerifiedAt && user.provider === ProviderEnum.SYSTEM) {
    await issueEmailOtp({ email, purpose: 'email-verification' });
  }
  return { messageCode: 704, statusCode: 200 };
});

export const confirmEmail = asyncHandler(async ({ email, otp }) => {
  const user = await findOne({ filter: { email }, model: UserModel });
  if (!user) throw NotFoundException({ messageCode: 401 });
  if (user.emailVerifiedAt) return { messageCode: 705, statusCode: 200 };

  await verifyEmailOtp({ email, otp, purpose: 'email-verification' });
  await updateOne({
    filter: { _id: user._id },
    update: { $set: { emailVerifiedAt: new Date() } },
    model: UserModel,
  });

  return { messageCode: 705, statusCode: 200 };
});

export const forgotPassword = asyncHandler(async ({ email }) => {
  const user = await findOne({ filter: { email }, model: UserModel });
  if (user && user.provider === ProviderEnum.SYSTEM) {
    await issueEmailOtp({ email, purpose: 'password-reset' });
  }
  return { messageCode: 706, statusCode: 200 };
});

export const resetPassword = asyncHandler(async ({ email, otp, password }) => {
  const user = await findOne({ filter: { email }, model: UserModel });
  if (!user || user.provider !== ProviderEnum.SYSTEM) {
    throw BadRequestException({ messageCode: 707 });
  }

  await verifyEmailOtp({ email, otp, purpose: 'password-reset' });
  if (await compare(password, user.password)) {
    throw ConflictException({ messageCode: 412 });
  }

  await updateOne({
    filter: { _id: user._id },
    update: { $set: { password: await hash(password) } },
    model: UserModel,
  });
  return { messageCode: 709, statusCode: 200 };
});

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

    const { accessToken, refreshToken } = await createLoginCredential({
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
      emailVerifiedAt: new Date(),
      profileImage: payload.picture || null,
      DOB: new Date('1970-01-01'),
      phoneNumber: encrypt(`google:${payload.googleId}`),
      gender: 0,
    },
    options: { lean: true },
  });

  const { accessToken, refreshToken } = await createLoginCredential({
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

  if (user.emailVerifiedAt === null) {
    throw ConflictException({ messageCode: 408 });
  }

  if (user.provider === ProviderEnum.GOOGLE) throw ConflictException({ messageCode: 301 });

  if (!(await compare(password, user.password))) {
    throw ConflictException({
      messageCode: 301,
    });
  }

  const { accessToken, refreshToken } = await createLoginCredential({
    id: user.id,
    role: user.role,
    iss,
  });
  return {
    messageCode: 309,
    statusCode: 200,
    accessToken,
    refreshToken,
  };
});

export const profile = asyncHandler(
  async ({ firstName, lastName, username, DOB, phoneNumber, profileImage, coverImage }) => {
    return {
      messageCode: 127,
      statusCode: 200,
      data: { firstName, lastName, username, DOB, profileImage, coverImage },
    };
  }
);

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

  const { accessToken } = await createLoginCredential({ id: user.id, role: user.role, iss });
  await revokeToken({ payload });
  return {
    accessToken,
    messageCode: 107,
  };
});

export const logout = asyncHandler(async (payload) => {
  return await revokeToken({ payload });
});

export const logoutAll = asyncHandler(async (payload) => {
  return await revokeToken({ payload });
});
