import { createClient } from 'redis';
import { REDIS_URI } from '../../config/config.js';

export const client = createClient({
  url: REDIS_URI,
});

export const setCache = async ({ key, value, options = {} } = {}) => {
  return await client.set(key, JSON.stringify(value), options);
};

export const getCache = async ({ key } = {}) => {
  const value = await client.get(key);

  return value ? JSON.parse(value) : null;
};

export const deleteCache = async ({ key } = {}) => {
  return await client.del(key);
};

export const cacheExists = async ({ key } = {}) => {
  return (await client.exists(key)) > 0;
};

export const expireCache = async ({ key, seconds } = {}) => {
  return await client.expire(key, seconds);
};

export const getTTL = async ({ key } = {}) => {
  return await client.ttl(key);
};

export const persistCache = async ({ key } = {}) => {
  return await client.persist(key);
};

export const incrementCache = async ({ key, amount = 1 } = {}) => {
  return await client.incrBy(key, amount);
};

export const decrementCache = async ({ key, amount = 1 } = {}) => {
  return await client.decrBy(key, amount);
};
