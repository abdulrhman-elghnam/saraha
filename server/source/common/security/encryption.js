import { config } from '#/configuration/_index.js';
import crypto from 'crypto';

export const encrypt = (text) => {
  const key = Buffer.from(config.ENCRYPTION_SECRET_KEY, 'hex');
  const iv = crypto.randomBytes(config.IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

  let encryptedData = cipher.update(text, 'utf8', 'hex');
  encryptedData += cipher.final('hex');

  return `${iv.toString('hex')}:${encryptedData}`;
};
