import Joi from 'joi';

export const signUpSchema = Joi.object({
  fullName: Joi.string()
    .min(3)
    .max(30)
    .trim()
    .pattern(/^[a-zA-Z]+(?: [a-zA-Z]+)*$/)
    .required()
    .messages({
      'string.base': 'Fullname must be a string',
      'string.empty': 'Fullname is required',
      'string.min': 'Fullname must be at least 3 characters',
      'string.max': 'Fullname must not exceed 30 characters',
      'string.pattern.base': 'Fullname can only contain English letters and spaces',
      'any.required': 'Fullname is required',
    }),

  username: Joi.string()
    .min(3)
    .max(30)
    .trim()
    .pattern(/^[a-zA-Z0-9_]+$/)
    .required()
    .messages({
      'string.base': 'Username must be a string',
      'string.empty': 'Username is required',
      'string.min': 'Username must be at least 3 characters',
      'string.max': 'Username must not exceed 30 characters',
      'string.pattern.base': 'Username can only contain letters, numbers, and underscores',
      'any.required': 'Username is required',
    }),

  email: Joi.string().email().lowercase().trim().required().messages({
    'string.base': 'Email must be a string',
    'string.empty': 'Email is required',
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),

  password: Joi.string()
    .min(8)
    .max(30)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).+$/)
    .required()
    .messages({
      'string.base': 'Password must be a string',
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 8 characters',
      'string.max': 'Password must not exceed 30 characters',
      'string.pattern.base':
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      'any.required': 'Password is required',
    }),

  confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
    'string.base': 'Confirm password must be a string',
    'string.empty': 'Confirm password is required',
    'any.only': 'Confirm password must match password',
    'any.required': 'Confirm password is required',
  }),

  DOB: Joi.date()
    .min(new Date(new Date().setFullYear(new Date().getFullYear() - 100)))
    .max(new Date(new Date().setFullYear(new Date().getFullYear() - 18)))
    .required()
    .messages({
      'date.base': 'DOB must be a valid date',
      'date.min': 'You must not be older than 100 years',
      'date.max': 'You must be at least 18 years old',
      'any.required': 'Date of birth is required',
    }),

  profileImage: Joi.string().uri().optional().allow(null).messages({
    'string.base': 'Profile image must be a string',
    'string.uri': 'Profile image must be a valid URL',
  }).optional,

  coverImage: Joi.string()
    .uri()
    .optional()
    .allow(null)
    .messages({
      'string.base': 'Cover image must be a string',
      'string.uri': 'Cover image must be a valid URL',
    })
    .optional(),
});
