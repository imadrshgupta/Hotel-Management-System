import { Request, Response, NextFunction } from 'express';
import { getRedisClient } from '../config/redis';
import { RateLimitError } from '../errors/app-error';
import { env } from '../config/env';

interface RateLimitOptions {
  windowMs?: number;
  max?: number;
  keyPrefix?: string;
}

export function rateLimiter(options: RateLimitOptions = {}) {
  const windowMs = options.windowMs || env.RATE_LIMIT_WINDOW_MS;
  const max = options.max || env.RATE_LIMIT_MAX;
  const keyPrefix = options.keyPrefix || 'rl';

  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const redis = getRedisClient();
      const clientId = getClientId(req);
      const key = `${keyPrefix}:${clientId}`;

      const current = await redis.incr(key);
      if (current === 1) {
        await redis.pexpire(key, windowMs);
      }

      if (current > max) {
        const ttl = await redis.pttl(key);
        _res.setHeader('Retry-After', Math.ceil(ttl / 1000));
        _res.setHeader('X-RateLimit-Limit', max);
        _res.setHeader('X-RateLimit-Remaining', 0);
        _res.setHeader('X-RateLimit-Reset', Math.ceil((Date.now() + ttl) / 1000));
        return next(new RateLimitError());
      }

      _res.setHeader('X-RateLimit-Limit', max);
      _res.setHeader('X-RateLimit-Remaining', max - current);

      next();
    } catch (error) {
      // If Redis is down, don't block requests
      next();
    }
  };
}

function getClientId(req: Request): string {
  // Use user ID if authenticated, otherwise IP
  if ((req as any).user?.userId) {
    return `user:${(req as any).user.userId}`;
  }
  return `ip:${req.ip || req.socket.remoteAddress || 'unknown'}`;
}

// Stricter rate limit for auth endpoints
export const authRateLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  keyPrefix: 'rl:auth',
});
