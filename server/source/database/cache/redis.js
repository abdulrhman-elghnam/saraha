import { createClient } from "redis"
import { REDIS_URI } from "../../configuration/configuration.js";

export const client = createClient({
  url: REDIS_URI
});