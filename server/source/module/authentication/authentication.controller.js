import { Router } from 'express';
import {
  logIn,
  profile,
  signUp,
  rotateToken,
  signUpWithGoogle,
  logInWithGoogle,
} from './authentication.service.js';
import { signUpSchema } from './dto/signUp.dto.js';
import { loginSchema } from './dto/login.dto.js';
import {
  acceptLanguage,
  authenticationGuard,
  authorizationGuard,
  SystemRoleEnum,
  TokenTypeEnum,
  validationPipe,
} from '#/common/_index.js';
import { sendSuccess } from '../../common/handler/_index.js';

export const authenticationController = Router();

authenticationController.post(
  '/signup',
  validationPipe({ schema: signUpSchema }),
  async (request, response) => {
    const serviceFeedback = await signUp(request.body, request.user);
    return sendSuccess({
      response,
      language: acceptLanguage({ request }),
      ...serviceFeedback,
    });
  }
);

authenticationController.post(
  '/login',
  validationPipe({ schema: loginSchema }),
  async (request, response) => {
    const serviceFeedback = await logIn(request.body);
    return sendSuccess({
      response,
      language: acceptLanguage({ request }),
      ...serviceFeedback,
    });
  }
);

authenticationController.post('/google-signUp', async (request, response) => {
  const serviceFeedback = await signUpWithGoogle(request.body, request.user);
  return sendSuccess({
    response,
    language: acceptLanguage({ request }),
    ...serviceFeedback,
  });
});

authenticationController.post('/google-login', async (request, response) => {
  const serviceFeedback = await logInWithGoogle(request.body);
  return sendSuccess({
    response,
    language: acceptLanguage({ request }),
    ...serviceFeedback,
  });
});

authenticationController.post(
  '/rotate-token',
  authenticationGuard({ tokenType: TokenTypeEnum.REFRESH }),
  async (request, response) => {
    const serviceFeedback = await rotateToken(request.body, request.user);
    return sendSuccess({
      response,
      language: acceptLanguage({ request }),
      ...serviceFeedback,
    });
  }
);

authenticationController.get(
  '/profile',
  authenticationGuard(),
  authorizationGuard({ role: [SystemRoleEnum.USER] }),
  async (request, response) => {
    const serviceFeedback = await profile(request.user);
    return sendSuccess({
      response,
      language: request.headers['accept-language'],
      ...serviceFeedback,
    });
  }
);
