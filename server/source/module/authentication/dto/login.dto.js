import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please provide a valid email address')
    .trim()
    .toLowerCase(),

  password: z
    .string()
    .min(1, 'Password is required'),
});