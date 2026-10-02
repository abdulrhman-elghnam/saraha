import { z } from 'zod';
import { generalValidationFields } from '../../../common/pipe/validation.js';

export const loginSchema = (lang) => {
  return z.object({
    email: generalValidationFields.email(lang),
    password: generalValidationFields.password(lang),
  });
};
