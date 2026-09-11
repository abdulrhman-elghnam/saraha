import mongoose from 'mongoose';
import { config } from './../../../configuration/main/configuration.js';
export const databaseConnection = mongoose.connect(config.DATABASE_URI);
