import { createClient } from 'redis';
import { REDIS_URI } from '../../config/configEnv.js';

export const cacheClient = createClient({
  url: REDIS_URI,
});
