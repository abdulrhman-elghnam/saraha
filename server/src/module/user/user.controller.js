import { Router } from 'express';
import { upload, verifyRealFileType } from '../../common/upload/multer.js';
import { uploadAvatar } from './user.service.js';
import { authenticationGuard } from '../../common/guard/authentication.js';
import { authorizationGuard } from '../../common/role/authorization.js';
import { SystemRoleEnum } from '../../common/value/enum.js';
import { sendSuccess } from '#/common/util/util.js';

export const userController = Router();

userController.post(
  '/upload-avatar',
  authenticationGuard(),
  authorizationGuard({ role: [SystemRoleEnum.ADMIN, SystemRoleEnum.ADMIN] }),
  upload.single('file'),
  verifyRealFileType,
  async (req, res, next) => {
    const serviceFeedback = await uploadAvatar(req.file, req.user);
    sendSuccess({ res, data: serviceFeedback });
  }
);
