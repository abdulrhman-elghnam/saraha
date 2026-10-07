import { z } from 'zod';

import { chooseLanguage } from '../../../common/lang/lang.js';
import { generalValidationFields } from '../../../common/pipe/validation.js';

export const signUpSchema = (lang) => ({
  body: z
    .object({
      fullName: generalValidationFields.fullName(lang),
      username: generalValidationFields.username(lang),
      email: generalValidationFields.email(lang),
      password: generalValidationFields.password(lang),
      confirmPassword: generalValidationFields.confirmPassword(lang),
      gender: generalValidationFields.gender(lang),
      phoneNumber: generalValidationFields.phoneNumber(lang),
      DOB: generalValidationFields.DOB(lang),
      profileImage: generalValidationFields.profileImage(lang),
      coverImage: generalValidationFields.coverImage(lang),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: chooseLanguage({
        lang,
        code: 217,
      }),
      path: ['confirmPassword'],
    }),

  params: z.object({}),

  query: z.object({}),
});
