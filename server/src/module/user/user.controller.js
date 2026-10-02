import { Router } from 'express';
import { upload } from '../../common/upload/multer.js';
import { uploadAvatar } from './user.service.js';
import { authenticationGuard } from '../../common/guard/authentication.js';
import { authorizationGuard } from '../../common/role/authorization.js';
import { sendSuccess } from '../../common/handler/success.js';
import { SystemRoleEnum } from '../../common/value/enum.js';

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
