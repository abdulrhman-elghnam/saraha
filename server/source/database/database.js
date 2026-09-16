import { config } from '#/configuration/configuration.js';
import mongoose from 'mongoose';

export const databaseConnection = mongoose.connect(config.DATABASE_URI);
