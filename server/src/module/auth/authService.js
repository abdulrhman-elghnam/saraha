import {
    compare,
    encrypt,
    getTokenExpiration,
    hash,
    verifyGoogleAccount,
} from '#/common/security/_INDEX.js';
import { asyncHandler, BadRequestException, ConflictException, GenderEnum, LogoutTypeEnum, NotFoundException, ProviderEnum, sendEmail, UnauthorizedException } from '#/common/_EXPORT.js';
import { create, deleteCache, findCacheKeys, findOne, getCache, getEmailVerifyKey, getRevokedTokenKey, PORT, setCache, UserModel } from '#/core/_EXPORT.js';
import { verifyEmailTem } from '#/common/mail/emailTemplate.js';
import { createLoginCredential } from '#/common/security/access/systemCredentialsSecurityAccess.js';

export const systemSignUp = asyncHandler(
    async ({ fullName, gender, username, email, phoneNumber, password, DOB }) => {
        const isFind = await findOne({
            filter: { $or: [{ email }, { username }] },
            select: '-_id',
            model: UserModel,
        });

        if (isFind) ConflictException({ messageCode: 402 });

        await create({
            data: {
                fullName,
                username,
                email,
                gender,
                phoneNumber: encrypt(phoneNumber),
                password: await hash(password),
                DOB: new Date(DOB),
                emailVerifiedAt: null,
            },
            model: UserModel,
            options: {
                lean: true,
            },
        });
    }
);

export const googleSignUp = asyncHandler(async ({ idToken } = {}, iss) => {
    const payload = await verifyGoogleAccount(idToken);

    const isExist = await findOne({
        model: UserModel,
        filter: { email: payload.email },
    });


    if (isExist) {
        if (isExist.provider !== ProviderEnum.GOOGLE) {
            throw ConflictException({
                messageCode: 301,
            });
        }

        const { accessToken, refreshToken } = await createLoginCredential({
            id: isExist.id,
            role: isExist.role,
            iss,
        });

        return {
            messageCode: 309,
            statusCode: 200,
            accessToken,
            refreshToken,
        };
    }

    const nameParts = (payload.name || payload.email.split('@')[0]).trim().split(/\s+/);
    const usernameBase =
        payload.email
            .split('@')[0]
            .replace(/[^a-zA-Z0-9_]/g, '')
            .slice(0, 20) || 'user';
    const username = `${usernameBase}_${payload.googleId.slice(-8)}`.slice(0, 30);


    const [user] = await create({
        model: UserModel,
        data: {
            firstName: nameParts[0] || 'Google',
            lastName: nameParts.slice(1).join(' ') || 'User',
            username,
            email: payload.email,
            provider: ProviderEnum.GOOGLE,
            emailVerifiedAt: new Date(),
            profileImage: payload.picture || null,
            DOB: new Date('1970-01-01'),
            phoneNumber: encrypt(`google:${payload.googleId}`),
            gender: GenderEnum.MALE,
        },
        options: { lean: true },
    });

    const { accessToken, refreshToken } = await createLoginCredential({
        id: user.id || user._id.toString(),
        role: user.role,
        iss,
    });

    return {
        messageCode: 104,
        statusCode: 201,
        accessToken,
        refreshToken,
    };
});

export const systemLogin = asyncHandler(async ({ email, password }, iss) => {
    const user = await findOne({
        filter: { email },
        model: UserModel,
    });

    if (!user) {
        throw NotFoundException({
            messageCode: 401,
        });
    }

    if (user.emailVerifiedAt === null) {
        throw ConflictException({ messageCode: 408 });
    }

    if (user.provider === ProviderEnum.GOOGLE) throw ConflictException({ messageCode: 301 });

    if (!(await compare(password, user.password))) {
        throw ConflictException({
            messageCode: 301,
        });
    }

    const { accessToken, refreshToken } = await createLoginCredential({
        id: user.id,
        role: user.role,
        iss,
        user
    });
    return {
        messageCode: 309,
        statusCode: 200,
        accessToken,
        refreshToken,
    };
});


export const sendVerifyEmail = async ({ email }) => {
    const user = await findOne({ filter: { email }, model: UserModel })
    console.log(user);

    if (user.emailVerifiedAt) ConflictException({ messageCode: 413 })
    await sendEmail({ to: email, html: verifyEmailTem({ verifyUrl: `http://127.0.0.1:${PORT}/authentication/verify-email?email=${email}`, email }) })
    await setCache({ key: getEmailVerifyKey(email), value: email, options: { EX: 120 } })
}

export const verifyEmail = async ({ email }) => {
    if (!await getCache({ key: getEmailVerifyKey(email) })) {
        ConflictException({ messageCode: 318 })
    }
    const user = await findOne({ filter: { email }, model: UserModel })
    if (!user) NotFoundException({ messageCode: 401 });
    if (user.emailVerifiedAt) {
        ConflictException({ messageCode: 413 })
    }
    user.emailVerifiedAt = new Date()
    await user.save()
    await deleteCache({ key: getEmailVerifyKey(email) })
    return
}

export const rotateToken = asyncHandler(
    async ({ expireToken } = {}, user, payload, iss) => {
        if (!expireToken) {
            throw BadRequestException({
                messageCode: 311,
            });
        }

        const expiresAt = getTokenExpiration({
            token: expireToken,
        });

        const renewalWindow = 5 * 60 * 1000;

        if (expiresAt > Date.now() + renewalWindow) {
            throw ConflictException({
                messageCode: 414,
            });
        }

        if (!payload?.sub || !payload?.jti || String(payload.sub) !== String(user.id)) {
            throw UnauthorizedException({
                messageCode: 302,
            });
        }

        const oldRefreshTokenKey = getRevokedTokenKey(payload);
        const oldRefreshTokenRemoved = await deleteCache({ key: oldRefreshTokenKey });
        if (oldRefreshTokenRemoved !== 1) {
            throw UnauthorizedException({
                messageCode: 302,
            });
        }

        const { accessToken, refreshToken } = await createLoginCredential({
            id: user.id,
            role: user.role,
            iss,
        });

        return {
            accessToken,
            refreshToken,
        };
    },
);

export const logout = asyncHandler(async ({ action }, user, payload) => {
    switch (action) {
        case LogoutTypeEnum.SINGLE:
            await deleteCache({key : getRevokedTokenKey({sub:payload.sub,jti:payload.jti})})
            break;
        case LogoutTypeEnum.ALL:
            const sessions = await findCacheKeys({ pattern: `USER::${payload.sub}::REVOKE-TOKEN::*` })
            await deleteCache({ key: sessions })
            break;
        default:
            break;
    }
})
