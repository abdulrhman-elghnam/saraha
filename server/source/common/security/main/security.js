import { config } from '#/configuration/configuration.js';
import crypto from 'node:crypto';
import bcrypt from 'bcrypt';

export const hash = async (plainText) => {
  const salt = bcrypt.genSaltSync(config.HASH_SALT);
  const hash = bcrypt.hashSync(plainText, salt);
  return hash;
};

export const compare = async (plainText, hashedText) => {
  return await bcrypt.compare(plainText, hashedText);
};

export const encrypt = (text) => {
  const key = Buffer.from(config.ENCRYPTION_SECRET_KEY, 'hex');
  const iv = crypto.randomBytes(config.IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

  let encryptedData = cipher.update(text, 'utf8', 'hex');
  encryptedData += cipher.final('hex');

  return `${iv.toString('hex')}:${encryptedData}`;
};

export const decrypt = (encryptedData) => {
  const [iv, encryptedText] = encryptedData.split(':');
  const key = Buffer.from(config.ENCRYPTION_SECRET_KEY, 'hex');
  const binaryLikeIv = Buffer.from(iv, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, binaryLikeIv);

  let decryptedData = decipher.update(encryptedText, 'hex', 'utf8');
  decryptedData += decipher.final('utf8');
  return decryptedData;
};
