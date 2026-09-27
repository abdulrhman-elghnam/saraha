import { z } from 'zod';
import { chooseLanguage, generalValidationFields } from '../../../common/_index.js';

export const signUpSchema = (lang) => {
  return z
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
      message: chooseLanguage({ Language: lang, code: 217 }),
      path: ['confirmPassword'],
    });
};
