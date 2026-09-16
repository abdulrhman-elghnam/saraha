import { config } from '#/configuration/index.js';
import { hash, compare, NotFoundException } from '#/common/index.js';
import { generateAccessToken, generateRefreshToken, verifyToken } from '#/common/main/jwt/index.js';
import { create, findById, findOne, UserModel } from '#/database/index.js';
import { ConflictException } from '../../../../common/index.js';

export const signUp = async ({ fullName, username, email, phoneNumber, password, DOB }) => {
  try {
    const isFind = await findOne({
      filter: { $or: [{ email }, { username }] },
      select: '-_id',
      model: UserModel,
    });
    const hashedPassword = await hash(password);
    if (isFind) ConflictException({ message: 'username or email is exist' });
    await create({
      data: { fullName, username, email, phoneNumber, password: hashedPassword, DOB: new Date(DOB) },
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

  console.log(user);
  const token = generateAccessToken({
    payload: {
      sub: user.id,
    },
    expiresIn: config.JWT_EXP,
  });

  return {
    message: 'login successfully',
    statusCode: 200,
    token,
  };
};


export const profile = async (user) => {
  const { firstName, lastName, username, DOB, phoneNumber, profileImage, coverImage } = user
   return {
    message: 'ok',
    statusCode: 200,
    data : { firstName, lastName, username, DOB, phoneNumber, profileImage, coverImage },
  };
};
