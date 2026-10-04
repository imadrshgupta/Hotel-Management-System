import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../config/env';
import { RefreshToken } from '../models/refresh-token.model';
import { AuthenticationError } from '../errors/app-error';
import { User } from '../models/user.model';

export interface TokenPayload {
  userId: string;
  email: string;
  organizationId?: string;
  propertyId?: string;
  role?: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT.SECRET, {
    expiresIn: env.JWT.EXPIRES_IN as any,
  });
}

export function generateRefreshToken(): string {
  return uuidv4();
}

export async function verifyAccessToken(token: string): Promise<TokenPayload> {
  try {
    const decoded = jwt.verify(token, env.JWT.SECRET) as TokenPayload;
    return decoded;
  } catch (error) {
    throw new AuthenticationError('Invalid or expired access token');
  }
}

export async function createTokenPair(
  user: User,
  organizationId?: string,
  propertyId?: string,
  userAgent?: string,
  ipAddress?: string
): Promise<TokenPair> {
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    organizationId,
    propertyId,
  };

  const accessToken = generateAccessToken(payload);
  const refreshTokenValue = generateRefreshToken();

  // Calculate refresh token expiry
  const refreshExpiryMs = parseDuration(env.JWT.REFRESH_EXPIRES_IN);
  const expiresAt = new Date(Date.now() + refreshExpiryMs);

  // Store refresh token
  await RefreshToken.create({
    user_id: user.id,
    token: refreshTokenValue,
    expires_at: expiresAt,
    user_agent: userAgent,
    ip_address: ipAddress,
  } as any);

  return {
    accessToken,
    refreshToken: refreshTokenValue,
    expiresIn: env.JWT.EXPIRES_IN,
  };
}

export async function refreshAccessToken(
  refreshTokenValue: string,
  userAgent?: string,
  ipAddress?: string
): Promise<TokenPair> {
  const refreshToken = await RefreshToken.findOne({
    where: {
      token: refreshTokenValue,
      is_revoked: false,
    },
  });

  if (!refreshToken) {
    throw new AuthenticationError('Invalid refresh token');
  }

  if (new Date(refreshToken.expires_at) < new Date()) {
    throw new AuthenticationError('Refresh token has expired');
  }

  // Get user
  const user = await User.findByPk(refreshToken.user_id);
  if (!user || !user.is_active) {
    throw new AuthenticationError('User not found or deactivated');
  }

  // Revoke old refresh token
  await refreshToken.update({ is_revoked: true } as any);

  // Resolve tenant context (organization + first active property) so the
  // refreshed token keeps the claims required by requireProperty.
  const organizationId = user.organization_id || undefined;
  let propertyId: string | undefined;
  if (organizationId) {
    const { Property } = require('./property.model');
    const property = await Property.findOne({
      where: { organization_id: organizationId, is_active: true },
      order: [['created_at', 'ASC']],
    });
    propertyId = property?.id;
  }

  // Create new token pair
  return createTokenPair(user, organizationId, propertyId, userAgent, ipAddress);
}

export async function revokeRefreshToken(token: string): Promise<void> {
  await RefreshToken.update(
    { is_revoked: true },
    { where: { token } }
  );
}

export async function revokeAllUserTokens(userId: string): Promise<void> {
  await RefreshToken.update(
    { is_revoked: true },
    { where: { user_id: userId } }
  );
}

function parseDuration(duration: string): number {
  const match = duration.match(/^(\d+)([smhd])$/);
  if (!match) return 7 * 24 * 60 * 60 * 1000; // default 7 days

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case 's': return value * 1000;
    case 'm': return value * 60 * 1000;
    case 'h': return value * 60 * 60 * 1000;
    case 'd': return value * 24 * 60 * 60 * 1000;
    default: return 7 * 24 * 60 * 60 * 1000;
  }
}
