import api from "./axios";
import type { ApiResponse, AuthTokens, LoginRequest, LoginResponse, User } from "@/types";

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const { data } = await api.post<ApiResponse<LoginResponse>>("/auth/login", credentials);
    return data.data;
  },

  async logout(refreshToken: string): Promise<void> {
    await api.post("/auth/logout", { refreshToken });
  },

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const { data } = await api.post<ApiResponse<AuthTokens>>("/auth/refresh", { refreshToken });
    return data.data;
  },

  async getProfile(): Promise<User> {
    const { data } = await api.get<ApiResponse<User>>("/auth/profile");
    return data.data;
  },

  async changePassword(passwords: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> {
    await api.post("/auth/change-password", passwords);
  },
};
