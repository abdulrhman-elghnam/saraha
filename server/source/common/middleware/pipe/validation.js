import { ApiLanguageEnum, chooseLanguage } from '../../_index.js';

export const validationPipe = ({ schema }) => {
  return (request, response, next) => {
    const result = schema.safeParse(request.body);
    if (!result.success) {
      return response.status(400).json({
        success: false,
        message: chooseLanguage({
          Language: request.headers['accept-language'] ?? ApiLanguageEnum.ENGLISH,
          code: 117,
        }),
        errors: result.error.issues.map(({ path, code }) => ({
          path,
          code,
          message: chooseLanguage({
            Language: request.headers['accept-language'] ?? ApiLanguageEnum.ENGLISH,
            code: 123,
          }),
        })),
      });
    }

    request.body = result.data;
    next();
  };
};

export const generalValidationFields = () => {};
