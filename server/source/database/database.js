import { DATABASE_URI } from '#/configuration/configuration.js';
import mongoose from 'mongoose';

export const databaseConnection = mongoose.connect(DATABASE_URI);
