import mongoose from 'mongoose';
export const toObjectId = (id) => new mongoose.Types.ObjectId(id);
export const issuer = ({ req } = {}) => `${req.protocol}://${req.host}`