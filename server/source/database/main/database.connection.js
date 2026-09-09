import { mongoose } from './database.js';
import { config } from './../../../configuration/main/configuration.js';
export const databaseConnection = mongoose.connect(config.DATABASE_URI);
