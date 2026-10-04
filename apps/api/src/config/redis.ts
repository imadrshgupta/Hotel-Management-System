import Redis from 'ioredis';
import { env } from './env';
import { logger } from './logger';

let redisClient: Redis | null = null;
let redisSubscriber: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redisClient) {
    redisClient = new Redis({
      host: env.REDIS.HOST,
      port: env.REDIS.PORT,
      password: env.REDIS.PASSWORD || undefined,
      maxRetriesPerRequest: 3,
      retryStrategy(times: number) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    redisClient.on('connect', () => {
      logger.info('Redis client connected');
    });

    redisClient.on('error', (err) => {
      logger.error('Redis client error:', err);
    });
  }
  return redisClient;
}

export function getRedisSubscriber(): Redis {
  if (!redisSubscriber) {
    redisSubscriber = new Redis({
      host: env.REDIS.HOST,
      port: env.REDIS.PORT,
      password: env.REDIS.PASSWORD || undefined,
      maxRetriesPerRequest: 3,
    });
  }
  return redisSubscriber;
}

export async function closeRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
  if (redisSubscriber) {
    await redisSubscriber.quit();
    redisSubscriber = null;
  }
  logger.info('Redis connections closed');
}

// Distributed lock helper
export async function acquireLock(
  key: string,
  ttlMs: number = 5000
): Promise<string | null> {
  const client = getRedisClient();
  const token = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const acquired = await client.set(`lock:${key}`, token, 'PX', ttlMs, 'NX');
  return acquired ? token : null;
}

export async function releaseLock(key: string, token: string): Promise<boolean> {
  const client = getRedisClient();
  const script = `
    if redis.call("get", KEYS[1]) == ARGV[1] then
      return redis.call("del", KEYS[1])
    else
      return 0
    end
  `;
  const result = await client.eval(script, 1, `lock:${key}`, token);
  return result === 1;
}
