import { config } from '#/configuration/main/configuration.js';
import bcrypt from 'bcrypt';

export const hash = async (text) => {
  return await bcrypt.hash(text, config.HASH_SALT);
};
