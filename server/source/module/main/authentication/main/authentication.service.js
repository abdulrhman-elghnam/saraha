import { ConflictException } from '../../../../common/index.js';
import { UserModel, create, findOne } from './../../../../database/index.js';

export const signUp = async ({ fullname, username, email, phone, password, DOB }) => {
  const isFind = await findOne({ filter: { email }, select: '-_id', model: UserModel });
  console.log(isFind);
  if (isFind) ConflictException({ message: 'email is exist' });
  const queryResult = await create({
    data: { fullname, username, email, phone, password, DOB },
    model: UserModel,
  });
  console.log(queryResult);
};
