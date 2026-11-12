import { z } from 'zod';

import { chooseLanguage } from '#/common/_EXPORT.js';

const objectId = (lang, code = 205) =>
  z.string().regex(/^[\da-f]{24}$/i, {
    message: chooseLanguage({ lang, code }),
  });

const emptyBody = z.object({}).optional().default({});

export const startConversationSchema = (lang) => ({
  body: z.object({
    participantId: objectId(lang, 207),
  }),
  params: z.object({}),
  query: z.object({}),
});

export const listConversationsSchema = (lang) => ({
  body: emptyBody,
  params: z.object({}),
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    size: z.coerce.number().int().min(1).max(50).default(20),
    // Polling: only return conversations updated after this timestamp.
    since: z.coerce.date({ message: chooseLanguage({ lang, code: 204 }) }).optional(),
  }),
});

export const conversationParamsSchema = (lang) => ({
  body: emptyBody,
  params: z.object({
    conversationId: objectId(lang),
  }),
  query: z.object({}),
});

export const listConversationMessagesSchema = (lang) => ({
  body: emptyBody,
  params: z.object({
    conversationId: objectId(lang),
  }),
  query: z
    .object({
      after: objectId(lang, 204).optional(),
     
      before: objectId(lang, 204).optional(),
      limit: z.coerce.number().int().min(1).max(100).default(30),
    })
    .refine((query) => !(query.after && query.before), {
      message: chooseLanguage({ lang, code: 204 }),
      path: ['after'],
    }),
});

export const sendConversationMessageSchema = (lang) => ({
  body: z.object({
    content: z
      .string()
      .trim()
      .max(5000, { message: chooseLanguage({ lang, code: 207 }) })
      .optional(),
  }),
  params: z.object({
    conversationId: objectId(lang),
  }),
  query: z.object({}),
});

export const conversationMessageParamsSchema = (lang) => ({
  body: emptyBody,
  params: z.object({
    conversationId: objectId(lang),
    messageId: objectId(lang),
  }),
  query: z.object({}),
});
