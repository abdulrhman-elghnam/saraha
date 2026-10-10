import mongoose from 'mongoose';
import { DATABASE_URI } from '../_EXPORT.js';

export const databaseConnection = mongoose.connect(DATABASE_URI);
