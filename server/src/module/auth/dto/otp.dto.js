import { generalValidationFields } from '#/common/middleware/_EXPORT.js';
import { email, z } from 'zod';

export const otpSchema = (lang) => ({
  body: z.object({
    email: generalValidationFields.email(lang),
    otp: generalValidationFields.otp(lang),
  }),

  params: z.object({}),

  query: z.object({}),
});
