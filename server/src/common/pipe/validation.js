import { z } from 'zod';
import { acceptLanguage } from '../util/util.js';
import { chooseLanguage } from '../lang/lang.js';
export const validationPipe = ({ schema }) => {
  return (request, response, next) => {
    const Language = acceptLanguage({ request });

    const result = schema(Language).safeParse(request.body);

    if (!result.success) {
      return response.status(400).json({
        success: false,

        message: chooseLanguage({
          Language,
          code: 201,
        }),

        errors: result.error.issues.map(({ path, code, message }) => ({
          path,
          code,
          message,
        })),
      });
    }
    request.body = result.data;

    next();
  };
};
export const generalValidationFields = {
  email: (lang) =>
    z
      .string({
        message: chooseLanguage({
          Language: lang,
          code: 208,
        }),
      })
      .trim()
      .min(1, {
        message: chooseLanguage({
          Language: lang,
          code: 208,
        }),
      })
      .email({
        message: chooseLanguage({
          Language: lang,
          code: 209,
        }),
      })
      .toLowerCase(),

  password: (lang) =>
    z
      .string({
        message: chooseLanguage({
          Language: lang,
          code: 212,
        }),
      })
      .min(8, {
        message: chooseLanguage({
          Language: lang,
          code: 214,
        }),
      })
      .max(30, {
        message: chooseLanguage({
          Language: lang,
          code: 215,
        }),
      }),

  confirmPassword: (lang) =>
    z
      .string({
        message: chooseLanguage({
          Language: lang,
          code: 216,
        }),
      })
      .min(1, {
        message: chooseLanguage({
          Language: lang,
          code: 216,
        }),
      }),

  username: (lang) =>
    z
      .string({
        message: chooseLanguage({
          Language: lang,
          code: 210,
        }),
      })
      .trim()
      .min(3, {
        message: chooseLanguage({
          Language: lang,
          code: 211,
        }),
      })
      .max(30, {
        message: chooseLanguage({
          Language: lang,
          code: 211,
        }),
      })
      .regex(/^[a-zA-Z0-9_]+$/, {
        message: chooseLanguage({
          Language: lang,
          code: 211,
        }),
      }),

  fullName: (lang) =>
    z
      .string({
        message: chooseLanguage({
          Language: lang,
          code: 222,
        }),
      })
      .trim()
      .min(3, {
        message: chooseLanguage({
          Language: lang,
          code: 223,
        }),
      })
      .max(30, {
        message: chooseLanguage({
          Language: lang,
          code: 223,
        }),
      })
      .regex(/^[a-zA-Z]+(?: [a-zA-Z]+)*$/, {
        message: chooseLanguage({
          Language: lang,
          code: 223,
        }),
      }),

  gender: (lang) =>
    z.union([z.literal(0), z.literal(1)], {
      message: chooseLanguage({
        Language: lang,
        code: 228,
      }),
    }),

  phoneNumber: (lang) =>
    z
      .string({
        message: chooseLanguage({
          Language: lang,
          code: 229,
        }),
      })
      .regex(/^(\+201|01)[0-2,5]{1}[0-9]{8}$/, {
        message: chooseLanguage({
          Language: lang,
          code: 230,
        }),
      }),

  DOB: (lang) =>
    z.coerce
      .date({
        message: chooseLanguage({
          Language: lang,
          code: 225,
        }),
      })
      .refine(
        (date) => {
          const today = new Date();

          const minDate = new Date();
          minDate.setFullYear(today.getFullYear() - 100);

          return date >= minDate;
        },
        {
          message: chooseLanguage({
            Language: lang,
            code: 227,
          }),
        }
      )
      .refine(
        (date) => {
          const today = new Date();

          const maxDate = new Date();
          maxDate.setFullYear(today.getFullYear() - 18);

          return date <= maxDate;
        },
        {
          message: chooseLanguage({
            Language: lang,
            code: 226,
          }),
        }
      ),

  profileImage: (lang) =>
    z
      .string({
        message: chooseLanguage({
          Language: lang,
          code: 231,
        }),
      })
      .url({
        message: chooseLanguage({
          Language: lang,
          code: 231,
        }),
      })
      .nullable()
      .optional(),

  coverImage: (lang) =>
    z
      .string({
        message: chooseLanguage({
          Language: lang,
          code: 232,
        }),
      })
      .url({
        message: chooseLanguage({
          Language: lang,
          code: 232,
        }),
      })
      .nullable()
      .optional(),
};
