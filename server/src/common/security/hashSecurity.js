import { HASH_SALT } from '#/core/_EXPORT.js';
import bcrypt from 'bcrypt';

// Async bcrypt runs on the libuv threadpool instead of blocking the event loop.
export const hash = async (plainText) => {
  return await bcrypt.hash(plainText, HASH_SALT);
};

export const compare = async (plainText, hashedText) => {
  return await bcrypt.compare(plainText, hashedText);
};
