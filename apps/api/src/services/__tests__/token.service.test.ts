import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

// Mock dependencies before imports
jest.mock('jsonwebtoken');
jest.mock('uuid');
jest.mock('../../config/env', () => ({
  env: {
    JWT: {
      SECRET: 'test-secret',
      EXPIRES_IN: '15m',
      REFRESH_SECRET: 'test-refresh-secret',
      REFRESH_EXPIRES_IN: '7d',
    },
  },
}));

jest.mock('../../config/database', () => ({
  getSequelize: jest.fn(),
}));

jest.mock('../../models/refresh-token.model', () => ({
  RefreshToken: {
    create: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  },
}));

jest.mock('../../models/user.model', () => ({
  User: {
    findByPk: jest.fn(),
  },
}));

jest.mock('../../config/websocket', () => ({
  broadcastToProperty: jest.fn(),
}));

import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  createTokenPair,
  refreshAccessToken,
  revokeRefreshToken,
  revokeAllUserTokens,
} from '../token.service';
import { RefreshToken } from '../../models/refresh-token.model';
import { User } from '../../models/user.model';

describe('TokenService', () => {
  const mockJwtSign = jwt.sign as any;
  const mockJwtVerify = jwt.verify as any;
  const mockUuid = uuidv4 as jest.MockedFunction<typeof uuidv4>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUuid.mockReturnValue('mock-uuid-123');
  });

  describe('generateAccessToken', () => {
    it('should generate an access token with payload', () => {
      mockJwtSign.mockReturnValue('mock-token');

      const payload = { userId: 'user-1', email: 'test@test.com' };
      const token = generateAccessToken(payload);

      expect(mockJwtSign).toHaveBeenCalledWith(payload, 'test-secret', {
        expiresIn: '15m',
      });
      expect(token).toBe('mock-token');
    });

    it('should include organization and property in payload', () => {
      mockJwtSign.mockReturnValue('mock-token');

      const payload = {
        userId: 'user-1',
        email: 'test@test.com',
        organizationId: 'org-1',
        propertyId: 'prop-1',
      };
      generateAccessToken(payload);

      expect(mockJwtSign).toHaveBeenCalledWith(
        expect.objectContaining({
          organizationId: 'org-1',
          propertyId: 'prop-1',
        }),
        'test-secret',
        expect.any(Object)
      );
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a UUID refresh token', () => {
      const token = generateRefreshToken();
      expect(mockUuid).toHaveBeenCalled();
      expect(token).toBe('mock-uuid-123');
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify and return decoded token', async () => {
      const payload = { userId: 'user-1', email: 'test@test.com' };
      mockJwtVerify.mockReturnValue(payload as any);

      const result = await verifyAccessToken('valid-token');

      expect(mockJwtVerify).toHaveBeenCalledWith('valid-token', 'test-secret');
      expect(result).toEqual(payload);
    });

    it('should throw AuthenticationError for invalid token', async () => {
      mockJwtVerify.mockImplementation(() => {
        throw new Error('jwt malformed');
      });

      await expect(verifyAccessToken('invalid-token')).rejects.toThrow(
        'Invalid or expired access token'
      );
    });

    it('should throw AuthenticationError for expired token', async () => {
      mockJwtVerify.mockImplementation(() => {
        throw new Error('jwt expired');
      });

      await expect(verifyAccessToken('expired-token')).rejects.toThrow(
        'Invalid or expired access token'
      );
    });
  });

  describe('createTokenPair', () => {
    it('should create token pair and store refresh token', async () => {
      mockJwtSign.mockReturnValue('mock-access-token');

      const mockUser = {
        id: 'user-1',
        email: 'test@test.com',
      } as any;

      const result = await createTokenPair(mockUser, 'org-1', 'prop-1', 'Chrome', '127.0.0.1');

      expect(mockJwtSign).toHaveBeenCalled();
      expect(RefreshToken.create).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'user-1',
          token: 'mock-uuid-123',
          user_agent: 'Chrome',
          ip_address: '127.0.0.1',
        })
      );
      expect(result.accessToken).toBe('mock-access-token');
      expect(result.refreshToken).toBe('mock-uuid-123');
      expect(result.expiresIn).toBe('15m');
    });

    it('should handle missing optional params', async () => {
      mockJwtSign.mockReturnValue('mock-access-token');

      const mockUser = {
        id: 'user-1',
        email: 'test@test.com',
      } as any;

      const result = await createTokenPair(mockUser);

      expect(RefreshToken.create).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'user-1',
          user_agent: undefined,
          ip_address: undefined,
        })
      );
      expect(result.accessToken).toBeDefined();
    });
  });

  describe('refreshAccessToken', () => {
    it('should refresh tokens successfully', async () => {
      const mockRefreshToken = {
        user_id: 'user-1',
        expires_at: new Date(Date.now() + 86400000),
        update: jest.fn(),
      };
      (RefreshToken.findOne as jest.Mock).mockResolvedValue(mockRefreshToken);

      const mockUser = {
        id: 'user-1',
        email: 'test@test.com',
        is_active: true,
      } as any;
      (User.findByPk as jest.Mock).mockResolvedValue(mockUser);

      mockJwtSign.mockReturnValue('new-access-token');

      const result = await refreshAccessToken('valid-refresh-token', 'Firefox', '127.0.0.1');

      expect(mockRefreshToken.update).toHaveBeenCalledWith({ is_revoked: true });
      expect(result.accessToken).toBe('new-access-token');
      expect(result.refreshToken).toBe('mock-uuid-123');
    });

    it('should throw error for invalid refresh token', async () => {
      (RefreshToken.findOne as jest.Mock).mockResolvedValue(null);

      await expect(refreshAccessToken('invalid-token')).rejects.toThrow(
        'Invalid refresh token'
      );
    });

    it('should throw error for expired refresh token', async () => {
      const mockRefreshToken = {
        user_id: 'user-1',
        expires_at: new Date(Date.now() - 86400000),
        update: jest.fn(),
      };
      (RefreshToken.findOne as jest.Mock).mockResolvedValue(mockRefreshToken);

      await expect(refreshAccessToken('expired-token')).rejects.toThrow(
        'Refresh token has expired'
      );
    });

    it('should throw error for inactive user', async () => {
      const mockRefreshToken = {
        user_id: 'user-1',
        expires_at: new Date(Date.now() + 86400000),
        update: jest.fn(),
      };
      (RefreshToken.findOne as jest.Mock).mockResolvedValue(mockRefreshToken);
      (User.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(refreshAccessToken('valid-token')).rejects.toThrow(
        'User not found or deactivated'
      );
    });

    it('should throw error for deactivated user', async () => {
      const mockRefreshToken = {
        user_id: 'user-1',
        expires_at: new Date(Date.now() + 86400000),
        update: jest.fn(),
      };
      (RefreshToken.findOne as jest.Mock).mockResolvedValue(mockRefreshToken);
      (User.findByPk as jest.Mock).mockResolvedValue({ is_active: false } as any);

      await expect(refreshAccessToken('valid-token')).rejects.toThrow(
        'User not found or deactivated'
      );
    });
  });

  describe('revokeRefreshToken', () => {
    it('should revoke a refresh token', async () => {
      (RefreshToken.update as jest.Mock).mockResolvedValue([1]);

      await revokeRefreshToken('token-to-revoke');

      expect(RefreshToken.update).toHaveBeenCalledWith(
        { is_revoked: true },
        { where: { token: 'token-to-revoke' } }
      );
    });
  });

  describe('revokeAllUserTokens', () => {
    it('should revoke all tokens for a user', async () => {
      (RefreshToken.update as jest.Mock).mockResolvedValue([3]);

      await revokeAllUserTokens('user-1');

      expect(RefreshToken.update).toHaveBeenCalledWith(
        { is_revoked: true },
        { where: { user_id: 'user-1' } }
      );
    });
  });
});
