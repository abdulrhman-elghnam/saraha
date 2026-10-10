import nodemailer from "nodemailer";
import {APP_MAIL , APP_PASSWORD} from "#/core/_EXPORT.js"
export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: APP_MAIL,
    pass: APP_PASSWORD,
  },
});

export const sendEmail = async ({
  to,
  subject,
  text,
  html,
}) => {
  return transporter.sendMail({
    from: process.env.MAIL_USER,
    to,
    subject,
    text,
    html,
  });
};

