import { Router } from 'express';
import { logIn, profile, signUp, rotateToken, signUpWithGoogle } from './authentication.service.js';
import { signUpSchema } from './dto/signUp.dto.js';
import { loginSchema } from './dto/login.dto.js';
import {
  authenticationGuard,
  authorizationGuard,
  SystemRole,
  TokenType,
  validationPipe,
} from '#/common/_index.js';
import { sendSuccess } from '#/common/structure/_index.js';

export const authenticationController = Router();

authenticationController.post(
  '/signup',
  validationPipe(signUpSchema),
  async (request, response) => {
    const serviceFeedback = await signUp(request.body, request.user);
    return sendSuccess({ response, ...serviceFeedback });
  }
);

authenticationController.post('/login', validationPipe(loginSchema), async (request, response) => {
  const serviceFeedback = await logIn(request.body);
  return sendSuccess({ response, ...serviceFeedback });
});

authenticationController.post('/google-signUp', async (request, response) => {
  const serviceFeedback = await signUpWithGoogle(request.body, request.user);
  return sendSuccess({ response, ...serviceFeedback });
});

authenticationController.get(
  '/profile',
  authenticationGuard(),
  authorizationGuard({ role: [SystemRole.USER] }),
  async (request, response) => {
    const serviceFeedback = await profile(request.user);
    return sendSuccess({ response, ...serviceFeedback });
  }
);

authenticationController.post(
  '/rotate-token',
  authenticationGuard({ tokenType: TokenType.REFRESH }),
  async (request, response) => {
    const serviceFeedback = await rotateToken(request.body, request.user);
    return sendSuccess({ response, ...serviceFeedback });
  }
);
