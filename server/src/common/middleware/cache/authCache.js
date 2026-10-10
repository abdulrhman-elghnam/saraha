import { ConflictException } from '#/common/_EXPORT.js';
import {
    expireCache,
    getCache,
    getEmailBlockKey,
    getEmailIncrementKey,
    incrementCache,
    setCache,
} from '#/core/_EXPORT.js';

export const loginAttempt = () => {
    return async (req, res, next) => {
        const { email } = req.body;
        const attemptKey = getEmailIncrementKey(email);
        const attempt = await incrementCache({ key: attemptKey });

        if (attempt === 1) {
            await expireCache({ key: attemptKey, seconds: 300 });
        }

        if (attempt >= 5) {
            await setCache({
                key: getEmailBlockKey(email),
                value: true,
                options: { EX: 300 },
            });
            throw ConflictException({ messageCode: 405 });
        }

        next();
    };
};

export const loginBlock = () => {
    return async (req, res, next) => {
        const { email } = req.body;

        if (await getCache({ key: getEmailBlockKey(email) })) {
            throw ConflictException({ messageCode: 405 });
        }

        next();
    };
};