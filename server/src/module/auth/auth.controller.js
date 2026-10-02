import { Router } from 'express';
import {
  logIn,
  profile,
  signUp,
  rotateToken,
  signUpWithGoogle,
  logOut,
} from './authentication.service.js';
import { signUpSchema } from './dto/signUp.dto.js';
import { loginSchema } from './dto/login.dto.js';
import { authenticationGuard } from '#/common/guard/authentication.js';
import { authorizationGuard } from '#/common/role/authorization.js';
import { acceptLanguage, issuer } from '#/common/util/util.js';
import { SystemRoleEnum, TokenTypeEnum } from '#/common/value/enum.js';
import { validationPipe } from '#/common/pipe/validation.js';
import { sendSuccess } from '../../common/handler/success.js';

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
    const serviceFeedback = await logIn(request.body, issuer({ request }));
    return sendSuccess({
      response,
      language: acceptLanguage({ request }),
      ...serviceFeedback,
    });
  }
);

authenticationController.post('/google-signUp', async (request, response) => {
  const serviceFeedback = await signUpWithGoogle(request.body, issuer({ request }));
  console.log(serviceFeedback);

  return sendSuccess({
    response,
    language: acceptLanguage({ request }),
    data: serviceFeedback,
  });
});

authenticationController.post(
  '/rotate-token',
  authenticationGuard({ tokenType: TokenTypeEnum.REFRESH }),
  async (request, response) => {
    const serviceFeedback = await rotateToken(
      request.body,
      request.user,
      request.payload,
      issuer({ request })
    );
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

authenticationController.post('/logout', authenticationGuard(), async (request, response) => {
  await logOut(request.payload);
  return sendSuccess({
    response,
    statusCode: 200,
    messageCode: 101,
    message: 'logout successfully',
  });
});
