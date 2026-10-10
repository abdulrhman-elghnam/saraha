
import { z } from 'zod';
import { acceptLanguage, ConflictException } from '#/common/_EXPORT.js';

export const validationPipe = ({ schema }) => {
  return (req, res, next) => {
    const lang = acceptLanguage({ req });

    const validationSchema = schema(lang);

    const result = z
      .object({
        body: validationSchema.body ?? z.object({}),
        params: validationSchema.params ?? z.object({}),
        query: validationSchema.query ?? z.object({}),
      })
      .safeParse({
        body: req.body,
        params: req.params,
        query: req.query,
      });

    if (!result.success) {
      return ConflictException({
        messageCode: 201,
        extra: result.error.issues.map(({ path, code, message }) => ({
          path,
          code,
          message,
        })),
      });
    }

    req.body = result.data.body;

    req.validated = {
      body: result.data.body,
      params: result.data.params,
      query: result.data.query,
    };

    next();
  };
}
