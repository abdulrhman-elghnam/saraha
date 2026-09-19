import { z } from 'zod';

export const signUpSchema = z
  .object({
    fullName: z
      .string()
      .min(3, 'Fullname must be at least 3 characters')
      .max(30, 'Fullname must not exceed 30 characters')
      .trim()
      .regex(
        /^[a-zA-Z]+(?: [a-zA-Z]+)*$/,
        'Fullname can only contain English letters and spaces',
      ),

    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(30, 'Username must not exceed 30 characters')
      .trim()
      .regex(
        /^[a-zA-Z0-9_]+$/,
        'Username can only contain letters, numbers, and underscores',
      ),

    email: z
      .string()
      .email('Please provide a valid email address')
      .trim()
      .toLowerCase(),

    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(30, 'Password must not exceed 30 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).+$/,
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      ),

    confirmPassword: z.string(),

    gender: z.union([z.literal(0), z.literal(1)], {
      message: 'Gender must be 0 or 1',
    }),

    phoneNumber: z
      .string()
      .regex(
        /^(\+201|01)[0-2,5]{1}[0-9]{8}$/,
        'Please provide a valid Egyptian phone number',
      ),

    DOB: z.coerce
      .date()
      .refine(
        (date) => {
          const today = new Date();
          const minDate = new Date();
          minDate.setFullYear(today.getFullYear() - 100);

          return date >= minDate;
        },
        'You must not be older than 100 years',
      )
      .refine(
        (date) => {
          const today = new Date();
          const maxDate = new Date();
          maxDate.setFullYear(today.getFullYear() - 18);

          return date <= maxDate;
        },
        'You must be at least 18 years old',
      ),

    profileImage: z
      .string()
      .url('Profile image must be a valid URL')
      .nullable()
      .optional(),

    coverImage: z
      .string()
      .url('Cover image must be a valid URL')
      .nullable()
      .optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Confirm password must match password',
    path: ['confirmPassword'],
  });