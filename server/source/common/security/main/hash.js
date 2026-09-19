import bcrypt from 'bcrypt';
import { config } from 'dotenv';

export const hash = async (plainText) => {
  const salt = bcrypt.genSaltSync(config.HASH_SALT);
  const hash = bcrypt.hashSync(plainText, salt);
  return hash;
};

export const compare = async (plainText, hashedText) => {
  return await bcrypt.compare(plainText, hashedText);
};
