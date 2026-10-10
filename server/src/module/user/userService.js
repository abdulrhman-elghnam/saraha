import { NotFoundException } from '#/common/_EXPORT.js';
import { deleteCache, findOne, getUserProfileCache, UserModel } from '#/core/_EXPORT.js';

export const profile = async ({ email }) => {
  return findOne({ filter: { email }, model: UserModel });
};

export const updateAvatar = async ({ email }, profileImage) => {
  const user = await findOne({ filter: { email }, model: UserModel });
  if (!user) {
    throw NotFoundException({ messageCode: 401 });
  }

  user.profileImage = profileImage;
  await user.save();
  await deleteCache({ key: getUserProfileCache(user.id) });

  return { profileImage: user.profileImage };
};