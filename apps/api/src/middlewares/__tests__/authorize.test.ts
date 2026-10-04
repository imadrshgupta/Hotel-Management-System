import { authorize, authorizeAny, invalidatePermissionCache } from '../authorize';

// Mock dependencies
jest.mock('../../config/redis', () => ({
  getRedisClient: jest.fn(),
}));

jest.mock('../../services/permission.service', () => ({
  getUserPermissions: jest.fn(),
}));

import { getRedisClient } from '../../config/redis';
import { getUserPermissions } from '../../services/permission.service';

describe('Authorize Middleware', () => {
  let req: any;
  let res: any;
  let next: jest.Mock;

  beforeEach(() => {
    req = {
      user: { userId: 'user-123' },
    };
    res = {};
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('authorize', () => {
    it('should call next() when user has required permissions', async () => {
      const mockRedis = {
        get: jest.fn().mockResolvedValue(null),
        set: jest.fn().mockResolvedValue('OK'),
      };
      (getRedisClient as jest.Mock).mockReturnValue(mockRedis);
      (getUserPermissions as jest.Mock).mockResolvedValue(['room.view', 'room.update']);

      const middleware = authorize('room.view');
      await middleware(req, res, next);

      expect(next).toHaveBeenCalledWith();
      expect(next).not.toHaveBeenCalledWith(expect.any(Error));
    });

    it('should call next(error) when user is not authenticated', async () => {
      req.user = undefined;

      const middleware = authorize('room.view');
      await middleware(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Authentication required',
        statusCode: 403,
      }));
    });

    it('should call next(error) when user lacks permissions', async () => {
      const mockRedis = {
        get: jest.fn().mockResolvedValue(null),
        set: jest.fn().mockResolvedValue('OK'),
      };
      (getRedisClient as jest.Mock).mockReturnValue(mockRedis);
      (getUserPermissions as jest.Mock).mockResolvedValue(['room.view']);

      const middleware = authorize('room.update');
      await middleware(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('Missing required permissions'),
        statusCode: 403,
      }));
    });

    it('should use cached permissions from Redis', async () => {
      const cachedPermissions = ['room.view', 'room.update'];
      const mockRedis = {
        get: jest.fn().mockResolvedValue(JSON.stringify(cachedPermissions)),
        set: jest.fn(),
      };
      (getRedisClient as jest.Mock).mockReturnValue(mockRedis);

      const middleware = authorize('room.view');
      await middleware(req, res, next);

      expect(mockRedis.get).toHaveBeenCalledWith('permissions:user-123');
      expect(getUserPermissions).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith();
    });

    it('should handle non-AuthorizationError gracefully', async () => {
      const mockRedis = {
        get: jest.fn().mockRejectedValue(new Error('Redis connection failed')),
        set: jest.fn(),
      };
      (getRedisClient as jest.Mock).mockReturnValue(mockRedis);

      const middleware = authorize('room.view');
      await middleware(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Authorization check failed',
        statusCode: 403,
      }));
    });
  });

  describe('authorizeAny', () => {
    it('should call next() when user has at least one required permission', async () => {
      const mockRedis = {
        get: jest.fn().mockResolvedValue(null),
        set: jest.fn().mockResolvedValue('OK'),
      };
      (getRedisClient as jest.Mock).mockReturnValue(mockRedis);
      (getUserPermissions as jest.Mock).mockResolvedValue(['room.view']);

      const middleware = authorizeAny('room.view', 'room.update');
      await middleware(req, res, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('should call next(error) when user has none of the required permissions', async () => {
      const mockRedis = {
        get: jest.fn().mockResolvedValue(null),
        set: jest.fn().mockResolvedValue('OK'),
      };
      (getRedisClient as jest.Mock).mockReturnValue(mockRedis);
      (getUserPermissions as jest.Mock).mockResolvedValue(['billing.view']);

      const middleware = authorizeAny('room.view', 'room.update');
      await middleware(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('Missing required permissions'),
        statusCode: 403,
      }));
    });

    it('should call next(error) when user is not authenticated', async () => {
      req.user = undefined;

      const middleware = authorizeAny('room.view');
      await middleware(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Authentication required',
        statusCode: 403,
      }));
    });
  });

  describe('invalidatePermissionCache', () => {
    it('should delete permission cache for user', async () => {
      const mockRedis = {
        del: jest.fn().mockResolvedValue(1),
      };
      (getRedisClient as jest.Mock).mockReturnValue(mockRedis);

      await invalidatePermissionCache('user-123');

      expect(mockRedis.del).toHaveBeenCalledWith('permissions:user-123');
    });
  });
});
