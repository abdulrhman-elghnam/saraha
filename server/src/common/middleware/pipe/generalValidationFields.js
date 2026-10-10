
import { z } from 'zod';
import { chooseLanguage } from '#/common/_EXPORT.js';

export const generalValidationFields = {
  email: (lang) =>
    z
      .string({
        message: chooseLanguage({
          lang,
          code: 208,
        }),
      })
      .trim()
      .min(1, {
        message: chooseLanguage({
          lang,
          code: 208,
        }),
      })
      .email({
        message: chooseLanguage({
          lang,
          code: 209,
        }),
      })
      .toLowerCase(),

  password: (lang) =>
    z
      .string({
        message: chooseLanguage({
          lang,
          code: 212,
        }),
      })
      .min(8, {
        message: chooseLanguage({
          lang,
          code: 214,
        }),
      })
      .max(30, {
        message: chooseLanguage({
          lang,
          code: 215,
        }),
      })
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
        message: chooseLanguage({
          lang,
          code: 213,
        }),
      }),

  confirmPassword: (lang) =>
    z
      .string({
        message: chooseLanguage({
          lang,
          code: 216,
        }),
      })
      .min(1, {
        message: chooseLanguage({
          lang,
          code: 216,
        }),
      }),

  username: (lang) =>
    z
      .string({
        message: chooseLanguage({
          lang,
          code: 210,
        }),
      })
      .trim()
      .min(3, {
        message: chooseLanguage({
          lang,
          code: 211,
        }),
      })
      .max(30, {
        message: chooseLanguage({
          lang,
          code: 211,
        }),
      })
      .regex(/^[a-zA-Z0-9_]+$/, {
        message: chooseLanguage({
          lang,
          code: 211,
        }),
      }),

  fullName: (lang) =>
    z
      .string({
        message: chooseLanguage({
          lang,
          code: 222,
        }),
      })
      .trim()
      .min(3, {
        message: chooseLanguage({
          lang,
          code: 223,
        }),
      })
      .max(30, {
        message: chooseLanguage({
          lang,
          code: 223,
        }),
      })
      .regex(/^[a-zA-Z]+(?: [a-zA-Z]+)*$/, {
        message: chooseLanguage({
          lang,
          code: 223,
        }),
      }),

  gender: (lang) =>
    z.enum(['MALE', 'FEMALE'], {
      message: chooseLanguage({
        Language: lang,
        code: 228,
      }),
    }),

  phoneNumber: (lang) =>
    z
      .string({
        message: chooseLanguage({
          lang,
          code: 229,
        }),
      })
      .regex(/^(\+201|01)[0-2,5]{1}[0-9]{8}$/, {
        message: chooseLanguage({
          lang,
          code: 230,
        }),
      }),

  DOB: (lang) =>
    z.coerce
      .date({
        message: chooseLanguage({
          lang,
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
            lang,
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
            lang,
            code: 226,
          }),
        }
      ),

  profileImage: (lang) =>
    z
      .string({
        message: chooseLanguage({
          lang,
          code: 231,
        }),
      })
      .url({
        message: chooseLanguage({
          lang,
          code: 231,
        }),
      })
      .nullable()
      .optional(),

  coverImage: (lang) =>
    z
      .string({
        message: chooseLanguage({
          lang,
          code: 232,
        }),
      })
      .url({
        message: chooseLanguage({
          lang,
          code: 232,
        }),
      })
      .nullable()
      .optional(),

  token: (lang) =>
    z.string({
      message: chooseLanguage({
        lang,
        code: 233,
      }),
    }),

  idToken: (lang) =>
    z.string({
      message: chooseLanguage({
        lang,
        code: 234,
      }),
    }),
};