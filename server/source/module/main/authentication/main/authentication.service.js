import { config } from '#/configuration/index.js';
import { hash, compare, NotFoundException } from '#/common/index.js';
import { generateToken } from '#/common/main/jwt/index.js';
import { create, findOne, UserModel } from '#/database/index.js';
import { ConflictException } from '../../../../common/index.js';

export const signUp = async ({ fullName, username, email, phone, password, DOB }) => {
  try {
    const isFind = await findOne({
      filter: { $or: [{ email }, { username }] },
      select: '-_id',
      model: UserModel,
    });
    const hashedPassword = await hash(password)
    if (isFind) ConflictException({ message: 'username or email is exist' });
    await create({
      data: { fullName, username, email, phone, password: hashedPassword, DOB: new Date(DOB) },
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
  try {
    const user = await findOne({
      filter: { email },
      model: UserModel,
    });
    if (!user) NotFoundException({ message: 'user not found' });
    if (!await compare(password, user.password)) ConflictException({ message: "password is incorrect" })
    const token = generateToken({ payload: { id: user._id, email: user.email }, exp: config.JWT_EXP })
    return { message: 'login successfully', statusCode: 200, token };
  } catch (error) {
    ConflictException({ message: `${error}` });
  }
};


export const test = async (data , user ) => {
  console.log({data , user});
  // do any operation that depend on user 
}