import { Router } from 'express';
import { signUp } from './authentication.service.js';
import { signUpSchema } from './dto/index.js';
import { validation } from '#/common/index.js';
import { sendSuccess } from '#/common/main/structure/index.js';

export const authenticationController = Router();

authenticationController.post(
  '/signup',
  validation(signUpSchema),
  async (request, response) => {
    const serviceFeedback = await signUp(request.body , request.user);
    return sendSuccess({ response, ...serviceFeedback });
  }
);


