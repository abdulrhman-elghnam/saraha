import { Router } from 'express';
import { BadRequestException, fileFieldValidation, localFileUpload, sendSuccess, TokenTypeEnum } from '#/common/_EXPORT.js';
import { authenticationGuard, userProfileCache } from '#/common/middleware/_EXPORT.js';
import { profile, updateAvatar } from './userService.js';

export const userController = Router({ caseSensitive: true, strict: true });

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
  },
);

userController.post(
  '/avatar',
  authenticationGuard({ tokenType: TokenTypeEnum.ACCESS }),
  localFileUpload({
    customPath: 'avatar',
    validation: fileFieldValidation.image,
  }).single('avatar'),
  async (req, res) => {
    if (!req.file) {
      throw BadRequestException({ messageCode: 602 });
    }

    const serviceFeedback = await updateAvatar(req.user, req.file.finalPath);
    return sendSuccess({
      res,
      data: serviceFeedback,
      lang: req.acceptsLanguages()[0],
    });
  },
);