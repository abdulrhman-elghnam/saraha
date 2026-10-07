# Email OTP configuration

Configure SMTP credentials in the server's environment file (`.env.dev` or `.env.prod`):

```dotenv
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
APP_NAME=Saraha
```

`SMTP_USER` and `SMTP_PASS` fall back to `APP_MAIL` and `APP_PASSWORD`. Set `SMTP_SECURE=true`
when using an implicit-TLS port such as 465.

Sign-up sends an email-verification code. The OTP is bcrypt-hashed in Redis and expires after
2 minutes. Use `POST /authentication/confirm-email` to verify it, or
`POST /authentication/resend-email-otp` to request another code. System accounts cannot log in
until their email is verified. `POST /authentication/forgot-password` sends a password-reset code;
`POST /authentication/reset-password` consumes it and updates the password.