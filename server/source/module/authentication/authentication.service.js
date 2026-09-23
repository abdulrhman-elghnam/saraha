import {
  hash,
  compare,
  NotFoundException,
  BadRequestException,
  ConflictException,
  encrypt,
  createLoginCredential,
  getTokenExpiration,
} from '#/common/_index.js';
import { OAUTH_GOOGLE_CLIENT_ID } from '#/configuration/_index.js';
import { create, findOne, UserModel } from '#/database/_index.js';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client();

async function verifyGoogleAccount({ idToken }) {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: OAUTH_GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  return payload;
}

export const signUp = async ({ fullName, gender, username, email, phoneNumber, password, DOB }) => {
  try {
    const isFind = await findOne({
      filter: { $or: [{ email }, { username }] },
      select: '-_id',
      model: UserModel,
    });
    const hashedPassword = await hash(password);
    if (isFind) ConflictException({ message: 'username or email is exist' });
    await create({
      data: {
        fullName,
        username,
        email,
        gender,
        phoneNumber: encrypt(phoneNumber),
        password: hashedPassword,
        DOB: new Date(DOB),
      },
      model: UserModel,
      options: {
        lean: true,
      },
    });
    return { message: 'created', statusCode: 201 };
  } catch (error) {
    ConflictException({ message: `${error}` });
  }
};


export const signUpWithGoogle = async ({ idToken } = {}) => {
  if (!idToken) {
    throw BadRequestException({ message: 'google id token is required' });
  }

  const payload = await verifyGoogleAccount({ idToken });
  
  console.log(payload);
  

};
export const logIn = async ({ email, password }) => {
  const user = await findOne({
    filter: { email },
    model: UserModel,
  });

  if (!user) {
    throw NotFoundException({
      message: 'user not found',
    });
  }

  if (!(await compare(password, user.password))) {
    throw ConflictException({
      message: 'password is incorrect',
    });
  }
  const { accessToken, refreshToken } = createLoginCredential({ id: user.id, role: user.role });
  return {
    message: 'login successfully',
    statusCode: 200,
    accessToken,
    refreshToken,
  };
};

export const profile = async (user) => {
  const { firstName, lastName, username, DOB, phoneNumber, profileImage, coverImage } = user;
  return {
    message: 'ok',
    statusCode: 200,
    data: { firstName, lastName, username, DOB, phoneNumber, profileImage, coverImage },
  };
};

export const rotateToken = async ({ accessToken } = {}, user) => {
  if (!accessToken) {
    throw BadRequestException({
      message: 'access token is required',
    });
  }

  const expiresAt = getTokenExpiration({ token: accessToken });

  if (expiresAt > Date.now()) {
    throw ConflictException({
      message: 'access token has not expired yet',
    });
  }

  return createLoginCredential({
    id: user.id,
    role: user.role,
  });
};
