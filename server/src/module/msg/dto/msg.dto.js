import { z } from 'zod';

import { chooseLanguage } from '#/common/_EXPORT.js';

const messageId = (lang) =>
  z.string().regex(/^[\da-f]{24}$/i, {
    message: chooseLanguage({ lang, code: 205 }),
  });

export const sendMessageSchema = (lang) => ({
  body: z.object({
    content: z
      .string()
      .trim()
      .max(50000, {
        message: chooseLanguage({ lang, code: 207 }),
      })
      .refine((content) => content.length === 0 || content.length >= 2, {
        message: chooseLanguage({ lang, code: 207 }),
      })
      .optional(),
  }),
  params: z.object({
    receiverId: messageId(lang),
  }),
  query: z.object({}),
});

export const getMessageSchema = (lang) => ({
  body: z.object({}).optional().default({}),
  params: z.object({
    messageId: messageId(lang),
  }),
  query: z.object({}),
});

export const listMessagesSchema = () => ({
  body: z.object({}).optional().default({}),
  params: z.object({}),
  query: z.object({}),
});
