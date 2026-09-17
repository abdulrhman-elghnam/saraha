import { config } from '#/configuration/_index.js';
import { hash, compare, NotFoundException, encrypt } from '#/common/_index.js';
import { generateToken } from '#/common/security/jwt/_index.js';
import { create, findOne, UserModel } from '#/database/_index.js';
import { ConflictException } from '#/common/_index.js';

export const signUp = async ({ fullName,gender, username, email, phoneNumber, password, DOB }) => {
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

  const accessToken = generateToken({
    payload: {
      sub: user.id,
    },
    secret : config.ACCESS_USER_TOKEN_SECRET,
    expiresIn: config.ACCESS_USER_TOKEN_EXPIRY,
  });

    const refreshToken = generateToken({
    payload: {
      sub: user.id,
    },
    secret : config.REFRESH_TOKEN_SECRET,
    expiresIn: config.REFRESH_TOKEN_EXPIRY,
  });

  return {
    message: 'login successfully',
    statusCode: 200,
    accessToken,
    refreshToken
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
