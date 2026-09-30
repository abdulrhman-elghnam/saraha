import { Router } from 'express';
import { upload } from '../../common/upload/multer.js';
import { uploadAvatar } from './user.service.js';
import {
  authenticationGuard,
  authorizationGuard,
  sendSuccess,
  SystemRoleEnum,
} from '../../common/_index.js';

export const userController = Router();

userController.post(
  '/upload-avatar',
  authenticationGuard(),
  authorizationGuard({ role: [SystemRoleEnum.ADMIN, SystemRoleEnum.ADMIN] }),
  upload.single('file'),
  async (request, response, next) => {
    const serviceFeedback = await uploadAvatar(request.file, request.user);
    sendSuccess({ response, data: serviceFeedback });
  }
);
