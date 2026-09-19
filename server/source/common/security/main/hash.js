import { HASH_SALT } from '#/configuration/_index.js';
import bcrypt from 'bcrypt';

export const hash = async (plainText) => {
  const salt = bcrypt.genSaltSync(HASH_SALT);
  const hash = bcrypt.hashSync(plainText, salt);
  return hash;
};

export const compare = async (plainText, hashedText) => {
  return await bcrypt.compare(plainText, hashedText);
};
