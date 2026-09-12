import { config } from '#/configuration/main/configuration.js';
import mongoose from 'mongoose';

export const databaseConnection = mongoose.connect(config.DATABASE_URI);
