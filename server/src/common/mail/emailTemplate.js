export const verifyEmailTem = ({ verifyUrl , email }) => `
<!DOCTYPE html>
<html lang="en">
<body style="font-family: Arial; text-align: center; padding: 40px;">
  <h1>Hi ${email}</h1>
  <h2>Verify Your Email</h2>
  <p>Click below to verify your email address.</p>

  <a
    href="${verifyUrl}"
    style="
      display: inline-block;
      padding: 14px 28px;
      background: #171717;
      color: white;
      text-decoration: none;
      border-radius: 6px;
    "
  >
    Verify Email
  </a>

</body>
</html>
`;