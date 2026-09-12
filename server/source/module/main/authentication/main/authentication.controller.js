import { Router } from 'express';
import { logIn, signUp , test} from './authentication.service.js';
import { signUpSchema } from './dto/signUp.dto.js';
import { loginSchema } from './dto/login.dto.js';
import { authenticationGuard, validation } from '#/common/index.js';
import { sendSuccess } from '#/common/main/structure/index.js';

export const authenticationController = Router();

authenticationController.post('/signup', validation(signUpSchema), async (request, response) => {
  const serviceFeedback = await signUp(request.body, request.user);
  return sendSuccess({ response, ...serviceFeedback });
});

authenticationController.post('/login', validation(loginSchema), async (request, response) => {
  const serviceFeedback = await logIn(request.body);
  return sendSuccess({ response, ...serviceFeedback });
});

// test auth
authenticationController.post(
  '/test',
  authenticationGuard,
  async (request, response) => {
    const serviceFeedback = await test(request.body , request.user);
    return sendSuccess({ response, ...serviceFeedback });
  }
);
