import mongoose from 'mongoose';
import { ApiLanguageEnum } from '../value/_INDEX.js';

export const toObjectId = (id) => new mongoose.Types.ObjectId(id);

export const issuer = ({ req } = {}) => `${req.protocol}://${req.host}`;

export const createNumberOtp = () => Math.floor(Math.random() * (999999 - 100000 + 1) + 100000);

export const acceptLanguage = ({ req } = {}) =>
  req.headers['accept-language'] ?? ApiLanguageEnum.ENGLISH;

