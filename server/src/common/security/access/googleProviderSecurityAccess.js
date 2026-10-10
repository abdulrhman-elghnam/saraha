import { OAuth2Client } from 'google-auth-library';
import { BadRequestException } from '#/common/_EXPORT.js';
import { OAUTH_GOOGLE_CLIENT_ID } from '#/core/config/_INDEX.js';

const client = new OAuth2Client();

export async function verifyGoogleAccount(idToken) {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: OAUTH_GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();

  if (!payload?.email_verified || !payload.email || !payload.sub) {
    throw BadRequestException({ messageCode: 301 });
  }
  return {
    googleId: payload.sub,
    name: payload.name,
    email: payload.email.toLowerCase(),
    picture: payload.picture,
  };
}
