import nodemailer from "nodemailer";
import {APP_MAIL , APP_PASSWORD} from "#/core/config/config.js"
export const sendEmail = async ({
  to,
  cc,
  bcc,
  subject,
  html,
  attachments = [],
} = {}) => {
     
  const transporter = nodemailer.createTransport ({
    service: "gmail",
    auth: {
      user: APP_MAIL,
      pass: APP_PASSWORD,
    },
     tls: {
      rejectUnauthorized: false
    }
  });
  const info = await transporter.sendMail({
    to,
    cc,
    bcc,
    subject,
    html,
    attachments,
    from: `"${APPLICATION_NAME} 🎈" <${APP_MAIL}>`,
  });
  console.log("Message sent:", info.messageId);
};