import { z } from 'zod';
import { chooseLanguage } from '../../../common/lang/lang.js';
import { generalValidationFields } from '../../../common/pipe/validation.js';

export const emailSchema = (lang) => ({
  body: z.object({
    email: generalValidationFields.email(lang),
  }),
  params: z.object({}),
  query: z.object({}),
});

export const confirmEmailSchema = (lang) => ({
  body: z.object({
    email: generalValidationFields.email(lang),
    otp: z
      .string()
      .regex(/^\d{6}$/, { message: chooseLanguage({ lang, code: 703 }) }),
  }),
  params: z.object({}),
  query: z.object({}),
});

export const resetPasswordSchema = (lang) => ({
  body: z
    .object({
      email: generalValidationFields.email(lang),
      otp: z
        .string()
        .regex(/^\d{6}$/, { message: chooseLanguage({ lang, code: 703 }) }),
      password: generalValidationFields.password(lang),
      confirmPassword: generalValidationFields.confirmPassword(lang),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: chooseLanguage({ lang, code: 217 }),
      path: ['confirmPassword'],
    }),
  params: z.object({}),
  query: z.object({}),
});
