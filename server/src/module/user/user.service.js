import { cloudinaryUpload } from '../../common/upload/multer.js';
import { findById, findByIdAndUpdate } from '../../core/db/repo/repo.js';

export const uploadAvatar = async (image) => {
  try {
    const { url } = await cloudinaryUpload({ file: image, directory: 'avatar' });
    const updatedUser = await findByIdAndUpdate({});
  } catch (error) {
    next(error);
  }
};
