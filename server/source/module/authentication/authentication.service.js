import { config } from '#/configuration/_index.js';
import {
  hash,
  compare,
  NotFoundException,
  encrypt,
  createLoginCredential,
} from '#/common/_index.js';
import { create, findOne, UserModel } from '#/database/_index.js';
import { ConflictException } from '#/common/_index.js';

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
  const { accessToken, refreshToken } = createLoginCredential({ id: user.id });
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

export const rotateToken = async (payload, user) => {
  const accessExpiresAt = (payload.iat + config.ACCESS_USER_TOKEN_EXPIRY) * 1000;
  const currentTime = Date.now();
  const rotationWindow = 5 * 60 * 1000;

  if (accessExpiresAt - currentTime > rotationWindow) {
    throw ConflictException({
      message:
        'Sorry, you cannot create a new login until the access token reaches the rotation window',
    });
  }
  console.log({
    payload,
    user,
    accessExpiresAt,
    currentTime,
  });
};
