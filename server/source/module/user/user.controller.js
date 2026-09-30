import { Router } from 'express';
import { upload } from '../../common/upload/multer.js';

export const userController = Router();

userController.post('/uploadImage', upload.single('file'), async (request, response, next) => {
  return uploadAvatarImage(request.file)
});
