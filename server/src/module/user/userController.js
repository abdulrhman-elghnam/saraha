import { Router } from 'express';
import {
  BadRequestException,
  fileFieldValidation,
  localFileUpload,
  processFile,
  sendSuccess,
  TokenTypeEnum,
} from '#/common/_EXPORT.js';
import { authenticationGuard, userProfileCache } from '#/common/middleware/_EXPORT.js';
import { profile, updateAvatar, getPublicProfile } from './userService.js';

export const userController = Router({ caseSensitive: true, strict: true, mergeParams: true });

userController.get(
  '/profile',
  authenticationGuard({ tokenType: TokenTypeEnum.ACCESS }),
  userProfileCache(),
  async (req, res) => {
    const serviceFeedback = await profile(req.user);
    return sendSuccess({
      res,
      data: serviceFeedback,
      lang: req.acceptsLanguages()[0],
    });
  }
);

userController.post(
  '/avatar',
  authenticationGuard({ tokenType: TokenTypeEnum.ACCESS }),
  localFileUpload({
    validation: fileFieldValidation.image,
    customPath: 'avatars',
    maxFileSize: 5,
  }).single('avatar'),
  async (req, res) => {
    if (!req.file) {
      throw BadRequestException({ messageCode: 602 });
    }
    const avatarPath = req.file.path || req.file.finalPath;
    const serviceFeedback = await updateAvatar(req.user, avatarPath);
    return sendSuccess({
      res,
      data: serviceFeedback,
      lang: req.acceptsLanguages()[0],
    });
  }
);

userController.get(
  '/:identifier',
  async (req, res) => {
    const serviceFeedback = await getPublicProfile(req.params.identifier);
    return sendSuccess({
      res,
      data: serviceFeedback,
      lang: req.acceptsLanguages()[0],
    });
  }
);
