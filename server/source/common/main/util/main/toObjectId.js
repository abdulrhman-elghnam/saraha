import { mongoose } from '../../../../database/index.js';
export const toObjectId = (id) => new mongoose.Types.ObjectId(id);
