import Joi from 'joi';

export const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required().messages({
    'string.base': 'Email must be a string',
    'string.empty': 'Email is required',
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),

  password: Joi.string().required().messages({
    'string.base': 'Password must be a string',
    'string.empty': 'Password is required',
    'any.required': 'Password is required',
  }),
});
