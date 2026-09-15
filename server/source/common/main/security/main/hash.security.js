import { config } from '#/configuration/main/configuration.js';
import bcrypt from 'bcrypt';

export const hash = async (plainText) => {
  const salt = bcrypt.genSaltSync(config.HASH_SALT);
  const hash = bcrypt.hashSync(plainText, salt);
  return hash;
};
