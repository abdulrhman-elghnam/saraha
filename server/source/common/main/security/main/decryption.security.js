import { config } from '#/configuration/main/configuration.js';
import crypto from 'crypto';


export const decrypt = (encryptedData) => {
  const [iv, encryptedText] = encryptedData.split(':');
  const key = Buffer.from(config.ENCRYPTION_SECRET_KEY, 'hex');
  const binaryLikeIv = Buffer.from(iv, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, binaryLikeIv);
  
  let decryptedData = decipher.update(encryptedText, 'hex', 'utf8');
  decryptedData += decipher.final('utf8');
  return decryptedData;
};
