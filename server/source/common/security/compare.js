import bcrypt from 'bcrypt';

export const compare = async (plainText, hashedText) => {
  return await bcrypt.compare(plainText, hashedText);
};
