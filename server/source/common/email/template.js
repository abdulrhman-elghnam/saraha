export const WelcomeEmailTemplate = ({ name, url }) => {
  return `
    <h1>Welcome to our app</h1>
    <p>Thank you for signing up. Please click the link below to verify your email.</p>
    <a href="${url}">Verify your email</a>
  `;
};

export const ResetPasswordEmailTemplate = ({ name, url }) => {
  return `
    <h1>Reset your password</h1>
    <p>Please click the link below to reset your password.</p>
    <a href="${url}">Reset your password</a>
  `;
};

export const VerifyEmailTemplate = ({ name, url }) => {
  return `
    <h1>Verify your email</h1>
    <p>Please click the link below to verify your email.</p>
    <a href="${url}">Verify your email</a>
  `;
};
