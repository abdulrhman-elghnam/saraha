import { z } from 'zod';
import { generalValidationFields } from '../../../common/pipe/validation.js';

export const rotateTokenSchema = (lang) => ({
  body: z.object({
    expireToken: generalValidationFields.token(lang),
  }),
  params: z.object({}),
  query: z.object({}),
});
