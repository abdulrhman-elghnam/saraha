export const emailCacheKey = (email) => `EMAIL::${email}`
export const emailIncrementKey = (email) => `EMAIL-INCREMENT::${email}`
export const emailBlock = (email) => `BLOCKED-EMAIL::${email}`
export const emailOtpKey = (email, purpose) => `EMAIL-OTP::${purpose}::${email}`;
export const emailOtpAttemptKey = (email, purpose) => `EMAIL-OTP-ATTEMPTS::${purpose}::${email}`;