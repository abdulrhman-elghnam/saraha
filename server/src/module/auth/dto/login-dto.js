import { generalValidationFields } from '#/common/middleware/_EXPORT.js';
import { z } from 'zod';

export const loginSchema = (lang) => ({
  body: z.object({
    email: generalValidationFields.email(lang),
    password: generalValidationFields.password(lang),
  }),
  params: z.object({}),
  query: z.object({}),
});
