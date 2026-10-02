import { DATABASE_URI } from '#/core/config/config.js';
import mongoose from 'mongoose';

export const databaseConnection = mongoose.connect(DATABASE_URI);
