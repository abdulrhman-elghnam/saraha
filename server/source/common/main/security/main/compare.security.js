import bcrypt from 'bcrypt';

export const compare = async (text, hashedText) => {
  return await bcrypt.compare(text, hashedText);
};
