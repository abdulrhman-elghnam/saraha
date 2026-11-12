import { Router } from 'express';

import {
  BadRequestException,
  fileFieldValidation,
  localFileUpload,
  sendSuccess,
  verifyUploadedFiles,
} from '#/common/_EXPORT.js';
import { authenticationGuard, validationPipe } from '#/common/middleware/_EXPORT.js';
import {
  deleteConversationMessage,
  getConversation,
  getUnreadCount,
  listConversationMessages,
  listConversations,
  markConversationRead,
  sendConversationMessage,
  startConversation,
} from './conversationService.js';
import {
  conversationMessageParamsSchema,
  conversationParamsSchema,
  listConversationMessagesSchema,
  listConversationsSchema,
  sendConversationMessageSchema,
  startConversationSchema,
} from './dto/conversation.dto.js';


export const conversationController = Router({
  caseSensitive: true,
  strict: true,
  mergeParams: true,
});

conversationController.use(authenticationGuard());

conversationController.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

const lang = (req) => req.acceptsLanguages()[0];

conversationController.post(
  '/',
  validationPipe({ schema: startConversationSchema }),
  async (req, res) => {
    const { created, conversation } = await startConversation({
      user: req.user,
      participantId: req.validated.body.participantId,
    });
    return sendSuccess({
      res,
      statusCode: created ? 201 : 200,
      messageCode: created ? 104 : 107,
      lang: lang(req),
      data: { conversation },
    });
  }
);

conversationController.get(
  '/',
  validationPipe({ schema: listConversationsSchema }),
  async (req, res) => {
    const data = await listConversations({ user: req.user, ...req.validated.query });
    return sendSuccess({ res, messageCode: 107, lang: lang(req), data });
  }
);

conversationController.get('/unread-count', async (req, res) => {
  const data = await getUnreadCount({ user: req.user });
  return sendSuccess({ res, messageCode: 107, lang: lang(req), data });
});

conversationController.get(
  '/:conversationId',
  validationPipe({ schema: conversationParamsSchema }),
  async (req, res) => {
    const conversation = await getConversation({
      user: req.user,
      conversationId: req.validated.params.conversationId,
    });
    return sendSuccess({ res, messageCode: 107, lang: lang(req), data: { conversation } });
  }
);

conversationController.get(
  '/:conversationId/messages',
  validationPipe({ schema: listConversationMessagesSchema }),
  async (req, res) => {
    const data = await listConversationMessages({
      user: req.user,
      conversationId: req.validated.params.conversationId,
      ...req.validated.query,
    });
    return sendSuccess({ res, messageCode: 107, lang: lang(req), data });
  }
);

conversationController.post(
  '/:conversationId/messages',
  localFileUpload({
    validation: fileFieldValidation.image,
    customPath: 'conversations',
    maxFileSize: 10,
  }).array('attachments', 4),
  verifyUploadedFiles({ validation: fileFieldValidation.image }),
  validationPipe({ schema: sendConversationMessageSchema }),
  async (req, res) => {
    const files = req.files ?? [];
    const { content } = req.validated.body;

    if (!content && files.length === 0) {
      throw BadRequestException({ messageCode: 206 });
    }

    const message = await sendConversationMessage({
      user: req.user,
      conversationId: req.validated.params.conversationId,
      content,
      files,
    });
    return sendSuccess({
      res,
      statusCode: 201,
      messageCode: 104,
      lang: lang(req),
      data: { message },
    });
  }
);

conversationController.patch(
  '/:conversationId/read',
  validationPipe({ schema: conversationParamsSchema }),
  async (req, res) => {
    const data = await markConversationRead({
      user: req.user,
      conversationId: req.validated.params.conversationId,
    });
    return sendSuccess({ res, messageCode: 105, lang: lang(req), data });
  }
);

conversationController.delete(
  '/:conversationId/messages/:messageId',
  validationPipe({ schema: conversationMessageParamsSchema }),
  async (req, res) => {
    const message = await deleteConversationMessage({
      user: req.user,
      ...req.validated.params,
    });
    return sendSuccess({ res, messageCode: 106, lang: lang(req), data: { message } });
  }
);
