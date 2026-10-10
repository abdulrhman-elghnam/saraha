import { cacheClient } from '../_INDEX.js';

export const setCache = async ({ key, value, options = {} } = {}) => {
  return await cacheClient.set(key, JSON.stringify(value), options);
};

export const getCache = async ({ key } = {}) => {
  const value = await cacheClient.get(key);

  return value ? JSON.parse(value) : null;
};

export const deleteCache = async ({ key } = {}) => {
  return await cacheClient.del(key);
};

export const cacheExists = async ({ key } = {}) => {
  return (await cacheClient.exists(key)) > 0;
}; 

export const expireCache = async ({ key, seconds } = {}) => {
  return await cacheClient.expire(key, seconds);
};

export const getTTL = async ({ key } = {}) => {
  return await cacheClient.ttl(key);
};

export const persistCache = async ({ key } = {}) => {
  return await cacheClient.persist(key);
};

export const incrementCache = async ({ key, amount = 1 } = {}) => {
  return await cacheClient.incrBy(key, amount);
};

export const decrementCache = async ({ key, amount = 1 } = {}) => {
  return await cacheClient.decrBy(key, amount);
};



export const findCacheKeys = async ({ pattern = '*' } = {}) => {
    const keys = [];
    let cursor = '0';

    do {
        const result = await cacheClient.scan(cursor, {
            MATCH: pattern,
            COUNT: 100,
        });

        cursor = result.cursor;
        keys.push(...result.keys);
    } while (cursor !== '0');

    return keys;
};