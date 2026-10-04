import { User } from '../models/user.model';
import { AuthenticationError, NotFoundError, ValidationError } from '../errors/app-error';
import { createTokenPair, revokeRefreshToken, revokeAllUserTokens } from './token.service';
import bcrypt from 'bcryptjs';

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: any;
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export class AuthService {
  async login(input: LoginInput, userAgent?: string, ipAddress?: string): Promise<LoginResponse> {
    const user = await User.findOne({
      where: { email: input.email.toLowerCase(), is_active: true },
    });

    if (!user) {
      throw new AuthenticationError('Invalid email or password');
    }

    const isPasswordValid = await user.comparePassword(input.password);
    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Update last login
    await user.update({ last_login_at: new Date() } as any);

    // Get user roles for the first property
    const userWithRoles = await User.findByPk(user.id, {
      // @ts-ignore
      include: [{ model: (await import('../models/role.model')).Role, as: 'roles' }],
    });

    const roleSlug = (userWithRoles as any)?.roles?.[0]?.slug;

    // Resolve tenant context: the user's organization and their first active property.
    // These claims are required by the requireProperty middleware on protected routes.
    const organizationId = user.organization_id || undefined;
    let propertyId: string | undefined;
    if (organizationId) {
      const property = await (await import('../models/property.model')).Property.findOne({
        where: { organization_id: organizationId, is_active: true },
        order: [['created_at', 'ASC']],
      });
      propertyId = property?.id;
    }

    const tokens = await createTokenPair(
      user,
      organizationId,
      propertyId,
      userAgent,
      ipAddress
    );

    return {
      user: user.toJSON(),
      ...tokens,
    };
  }

  async logout(refreshToken: string): Promise<void> {
    await revokeRefreshToken(refreshToken);
  }

  async logoutAll(userId: string): Promise<void> {
    await revokeAllUserTokens(userId);
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      throw new AuthenticationError('Current password is incorrect');
    }

    if (newPassword.length < 8) {
      throw new ValidationError('New password must be at least 8 characters');
    }

    await user.update({
      password: newPassword,
      password_changed_at: new Date(),
    } as any);

    // Revoke all refresh tokens
    await revokeAllUserTokens(userId);
  }

  async getProfile(userId: string): Promise<any> {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new NotFoundError('User');
    }
    return user.toJSON();
  }
}

export const authService = new AuthService();
