import { Router } from 'express';
import { login, profile, signUp, rotateToken, signUpWithGoogle, logout } from './auth.service.js';
import { signUpSchema } from './dto/sign-up.dto.js';
import { loginSchema } from './dto/login.dto.js';
import { authenticationGuard } from '#/common/guard/authentication.js';
import { authorizationGuard } from '#/common/role/authorization.js';
import { acceptLanguage, issuer, sendSuccess } from '#/common/util/util.js';
import { SystemRoleEnum, TokenTypeEnum } from '#/common/value/enum.js';
import { validationPipe } from '#/common/pipe/validation.js';
import { rotateTokenSchema } from './dto/rotate-token.js';
import { loginAttemptGuard } from '#/common/guard/attempt.js';

export const authController = Router();

authController.post('/sign-up', validationPipe({ schema: signUpSchema }), async (req, res) => {
  const serviceFeedback = await signUp(req.body);
  return sendSuccess({
    response: res,
    language: acceptLanguage({ req }),
    ...serviceFeedback,
  });
});

authController.post('/login', validationPipe({ schema: loginSchema }) , loginAttemptGuard(), async (req, res) => {
  const serviceFeedback = await login(req.body, issuer({ req }));
  return sendSuccess({
    res,
    language: acceptLanguage({ req }),
    ...serviceFeedback,
  });
});

authController.post('/google-sign-up', async (req, res) => {
  const serviceFeedback = await signUpWithGoogle(req.body, issuer({ req }));
  console.log(serviceFeedback);

  return sendSuccess({
    res,
    language: acceptLanguage({ req }),
    data: serviceFeedback,
  });
});

authController.post(
  '/rotate-token',
  validationPipe({ schema: rotateTokenSchema }),
  authenticationGuard({ tokenType: TokenTypeEnum.REFRESH }),
  async (req, res) => {
    const serviceFeedback = await rotateToken(req.body, req.user, req.payload, issuer({ req }));
    return sendSuccess({
      res,
      lang: acceptLanguage({ req }),
      ...serviceFeedback,
    });
  }
);

authController.post('/logout', authenticationGuard(), async (req, res) => {
  await logout(req.payload);
  return sendSuccess({
    res,
    statusCode: 200,
    messageCode: 101,
  });
});

authController.post('/logout', authenticationGuard(), async (req, res) => {
  await logoutAll(req.payload);
  return sendSuccess({
    res,
    statusCode: 200,
    messageCode: 101,
  });
});

authController.get(
  '/profile',
  authenticationGuard(),
  authorizationGuard({ role: [SystemRoleEnum.USER] }),
  async (req, res) => {
    const serviceFeedback = await profile(req.user);
    return sendSuccess({
      res,
      language: acceptLanguage({ req }),
      ...serviceFeedback,
    });
  }
);
