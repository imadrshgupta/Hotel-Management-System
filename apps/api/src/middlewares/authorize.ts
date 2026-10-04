import { Request, Response, NextFunction } from 'express';
import { AuthorizationError } from '../errors/app-error';
import { getUserPermissions } from '../services/permission.service';
import { getRedisClient } from '../config/redis';

const PERMISSION_CACHE_TTL = 300; // 5 minutes

export function authorize(...requiredPermissions: string[]) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AuthorizationError('Authentication required');
      }

      const permissions = await getCachedPermissions(req.user.userId);

      const hasPermission = requiredPermissions.every((p) => permissions.includes(p));

      if (!hasPermission) {
        throw new AuthorizationError(
          `Missing required permissions: ${requiredPermissions.join(', ')}`
        );
      }

      next();
    } catch (error) {
      if (error instanceof AuthorizationError) {
        next(error);
      } else {
        next(new AuthorizationError('Authorization check failed'));
      }
    }
  };
}

export function authorizeAny(...requiredPermissions: string[]) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AuthorizationError('Authentication required');
      }

      const permissions = await getCachedPermissions(req.user.userId);

      const hasPermission = requiredPermissions.some((p) => permissions.includes(p));

      if (!hasPermission) {
        throw new AuthorizationError(
          `Missing required permissions: ${requiredPermissions.join(', ')}`
        );
      }

      next();
    } catch (error) {
      if (error instanceof AuthorizationError) {
        next(error);
      } else {
        next(new AuthorizationError('Authorization check failed'));
      }
    }
  };
}

async function getCachedPermissions(userId: string): Promise<string[]> {
  // Fetch from DB directly when Redis is unavailable (non-fatal by design).
  const permissions = await getUserPermissions(userId);

  try {
    const redis = getRedisClient();
    const cacheKey = `permissions:${userId}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
    await redis.set(cacheKey, JSON.stringify(permissions), 'EX', PERMISSION_CACHE_TTL);
  } catch {
    // Redis down — the DB lookup above already succeeded; skip caching.
  }

  return permissions;
}

export async function invalidatePermissionCache(userId: string): Promise<void> {
  try {
    const redis = getRedisClient();
    await redis.del(`permissions:${userId}`);
  } catch {
    // Redis unavailable — nothing to invalidate.
  }
}
