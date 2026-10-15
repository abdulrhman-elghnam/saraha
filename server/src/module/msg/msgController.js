import { Router } from 'express';

import {
  BadRequestException,
  fileFieldValidation,
  localFileUpload,
  sendSuccess,
  TokenTypeEnum,
} from '#/common/_EXPORT.js';
import { authenticationGuard, validationPipe } from '#/common/middleware/_EXPORT.js';
import { decodeToken } from '#/common/security/_INDEX.js';
import {
  createMessage,
  deleteMessage,
  getMessage,
  getMessages,
} from './msgService.js';
import {
  getMessageSchema,
  listMessagesSchema,
  sendMessageSchema,
} from './dto/msg.dto.js';

export const msgController = Router({
  caseSensitive: true,
  strict: true,
  mergeParams: true,
});

const optionalAuthentication = async (req, res, next) => {
  if (!req.headers.authorization) {
    return next();
  }

  const { user, payload } = await decodeToken({
    authorization: req.headers.authorization,
    tokenType: TokenTypeEnum.ACCESS,
  });
  req.user = user;
  req.payload = payload;
  return next();
};

msgController.post(
  '/:receiverId',
  optionalAuthentication,
  localFileUpload({
    validation: fileFieldValidation.image,
    customPath: 'messages',
    maxFileSize: 10,
  }).array('attachments', 2),
  validationPipe({ schema: sendMessageSchema }),
  async (req, res) => {
    const files = req.files ?? [];
    const { content } = req.body;

    if (!content && files.length === 0) {
      throw BadRequestException({ messageCode: 206 });
    }

    const message = await createMessage({
      receiverId: req.validated.params.receiverId,
      content,
      files,
      user: req.user,
    });

    return sendSuccess({
      res,
      statusCode: 201,
      messageCode: 104,
      lang: req.acceptsLanguages()[0],
      data: { message },
    });
  }
);

msgController.get(
  '/list',
  authenticationGuard(),
  validationPipe({ schema: listMessagesSchema }),
  async (req, res) => {
    const messages = await getMessages(req.user);
    return sendSuccess({
      res,
      messageCode: 107,
      lang: req.acceptsLanguages()[0],
      data: { messages },
    });
  }
);

msgController.get(
  '/:messageId',
  authenticationGuard(),
  validationPipe({ schema: getMessageSchema }),
  async (req, res) => {
    const message = await getMessage(req.validated.params.messageId, req.user);
    return sendSuccess({
      res,
      messageCode: 107,
      lang: req.acceptsLanguages()[0],
      data: { message },
    });
  }
);

msgController.delete(
  '/:messageId',
  authenticationGuard(),
  validationPipe({ schema: getMessageSchema }),
  async (req, res) => {
    const message = await deleteMessage(req.validated.params.messageId, req.user);
    return sendSuccess({
      res,
      messageCode: 106,
      lang: req.acceptsLanguages()[0],
      data: { message },
    });
  }
);
