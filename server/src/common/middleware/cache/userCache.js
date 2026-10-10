import { sendSuccess } from "#/common/_EXPORT.js";
import { getCache, getUserProfileCache } from "#/core/_EXPORT.js";

export const userProfileCache = () => {
    return async (req, res, next) => {
        const userData = await getCache({
            key: getUserProfileCache(req.user.id),
        });

        if (userData) {
            return sendSuccess({ res, messageCode: 107, data: userData });
        }

        next();
    }
}