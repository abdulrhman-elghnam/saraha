export const getRevokedTokenKey = ({ sub, jti }) => `USER::${sub}::REVOKE-TOKEN::${jti}`;
export const getEmailVerifyKey = (email)=>`EMAIL-VERIFY::${email}`
export const getUserProfileCache = (id) => `PROFILE::${id}` 


export const getEmailIncrementKey = (email) => `EMAIL-INCREMENT::${email}`;
export const getEmailBlockKey = (email) => `BLOCKED-EMAIL::${email}`;