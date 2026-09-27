import mongoose from 'mongoose';
import { ApiLanguageEnum } from '../_index.js';
export const toObjectId = (id) => new mongoose.Types.ObjectId(id);
export const issuer = ({ request } = {}) => `${request.protocol}://${request.host}`;
export const acceptLanguage = ({ request } = {}) => request.headers['accept-language'] ?? ApiLanguageEnum.ENGLISH;
