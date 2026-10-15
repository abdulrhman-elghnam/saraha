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

export const getPublicProfile = async (identifier) => {
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(identifier);
  const filter = isObjectId ? { _id: identifier } : { username: identifier };
  const user = await findOne({ filter, model: UserModel });
  if (!user || !user.emailVerifiedAt || user.deletedAt) {
    throw NotFoundException({ messageCode: 401 });
  }
  return {
    id: user._id.toString(),
    username: user.username,
    fullName: user.fullName,
    profileImage: user.profileImage,
    createdAt: user.createdAt,
  };
};
