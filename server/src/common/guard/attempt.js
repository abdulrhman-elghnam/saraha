import { deleteCache, expireCache, getCache, incrementCache, setCache } from "#/core/db/cache/cache.js";
import { emailBlock, emailCacheKey, emailIncrementKey } from "#/core/db/cache/key.js";
import { TooManyRequestsException } from "../exception/error.js";

export const loginAttemptGuard = ({
    attempt = 3,
    blockTimeInSec = 300
} = {}) => {
    return async (req, res, next) => {
        const { email } = req.body;

        const numberOfAttempt = await getCache({
            key: emailIncrementKey(email)
        });
        
        if (Number(numberOfAttempt) >= attempt) {
            await setCache({
                key: emailBlock(email),
                value: true,
                options: { EX: blockTimeInSec }
            });
            await expireCache({
                key: emailIncrementKey(email),
                seconds: blockTimeInSec
            })
            return TooManyRequestsException({ message: "Too many login attempts. Try again later.", })
        }
        await incrementCache({
            key: emailIncrementKey(email),
            value: 1,
        });

        next();
    };
};