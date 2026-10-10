import { Router } from 'express';
import { systemSignUp, googleSignUp, systemLogin, rotateToken, verifyEmail, sendVerifyEmail, logout } from './authService.js';
import { issuer, sendSuccess, TokenTypeEnum } from '#/common/_EXPORT.js';
import { validationPipe } from '#/common/middleware/pipe/validationPipe.js';
import { loginSchema } from './dto/login-dto.js';
import { signUpSchema, googleSignUpSchema } from './dto/sign-up.dto.js';
import { authenticationGuard } from '#/common/middleware/_EXPORT.js';
import { loginAttempt, loginBlock } from '#/common/middleware/cache/authCache.js';

export const authController = Router({ caseSensitive: true, strict: true });

authController.post(
    '/sign-up',
    validationPipe({ schema: signUpSchema }), async (req, res) => {
        await systemSignUp(req.body);
        return sendSuccess({ res, statusCode: 201, messageCode: 104, lang: req.acceptsLanguages()[0] });
    });

authController.post(
    '/google-credential',
    validationPipe({ schema: googleSignUpSchema }),
    async (req, res) => {
        const { statusCode } = await googleSignUp(req.body, issuer({ req }));
        return sendSuccess({ res, statusCode: statusCode, messageCode: 104, lang: req.acceptsLanguages()[0] });
    }
);

authController.post(
    '/login',
    validationPipe({ schema: loginSchema }),
    loginBlock(),
    loginAttempt(),
    async (req, res) => {
        const serviceFeedback = await systemLogin(req.body, issuer({ req }));
        return sendSuccess({ res, ...serviceFeedback, messageCode: 107, lang: req.acceptsLanguages()[0] });
    });

authController.post(
    '/send-verify-email',
    async (req, res) => {
        await sendVerifyEmail(req.body)
        return sendSuccess({ res, statusCode: 200, messageCode: 107, lang: req.acceptsLanguages()[0] });
    });

authController.get(
    '/verify-email',
    async (req, res) => {
        await verifyEmail(req.query)
        return sendSuccess({ res, statusCode: 200, messageCode: 107, lang: req.acceptsLanguages()[0] });
    });


authController.post(
    '/rotate-token',
    authenticationGuard({ tokenType: TokenTypeEnum.REFRESH }),
    async (req, res) => {
        const serviceFeedback = await rotateToken(req.body, req.user, req.payload, issuer({ req }))
        return sendSuccess({ res, statusCode: 200, messageCode: 107, lang: req.acceptsLanguages()[0], ...serviceFeedback });
    });

authController.post(
    '/logout',
    authenticationGuard({ tokenType: TokenTypeEnum.ACCESS }),
    async (req, res) => {
        const serviceFeedback = await logout(req.body , req.user, req.payload)
        return sendSuccess({ res, statusCode: 200, messageCode: 107, lang: req.acceptsLanguages()[0], ...serviceFeedback });
    });


