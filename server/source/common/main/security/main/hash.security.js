import bcrypt from 'bcrypt';
import { config } from '../../../../../configuration/index.js';
export const hash = async (text) => {
  return await bcrypt.hash(text, config.HASH_SALT);
};
