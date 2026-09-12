import { ConflictException } from '../../../../common/index.js';
import { UserModel, create, findOne } from './../../../../database/index.js';

export const signUp = async ({ fullName, username, email, phone, password, DOB }) => {
  const isFind = await findOne({ filter: { $or: [{ email }, { username }] }, select: '-_id', model: UserModel});
  if (isFind) ConflictException({ message: 'email or username is exist' });
  const queryResult = await create({
    data: { fullName, username, email, phone, password, DOB: new Date(DOB) },
    model: UserModel,
    options : {
      lean : true
    }
  });
  console.log(queryResult);
};

UserModel.create([{}])