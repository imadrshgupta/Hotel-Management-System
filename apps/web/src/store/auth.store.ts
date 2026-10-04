import { create } from "zustand";
import type { User, Permission } from "@/types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  propertyId: string | null;
  organizationId: string | null;
  permissions: string[];

  setUser: (user: User) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setPropertyId: (id: string) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
}

function extractPermissions(user: User | null): string[] {
  if (!user?.roles) return [];
  const perms = new Set<string>();
  user.roles.forEach((role) => {
    role.permissions?.forEach((p) => perms.add(p.slug));
  });
  return Array.from(perms);
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  propertyId: localStorage.getItem("propertyId"),
  organizationId: null,
  permissions: [],

  setUser: (user) => {
    const permissions = extractPermissions(user);
    set({
      user,
      isAuthenticated: true,
      isLoading: false,
      organizationId: user.organization_id || null,
      permissions,
    });
  },

  setTokens: (accessToken, refreshToken) => {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
  },

  setPropertyId: (id) => {
    localStorage.setItem("propertyId", id);
    set({ propertyId: id });
  },

  setLoading: (isLoading) => set({ isLoading }),

  logout: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("propertyId");
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      propertyId: null,
      organizationId: null,
      permissions: [],
    });
  },

  hasPermission: (permission: string) => {
    return get().permissions.includes(permission);
  },

  hasAnyPermission: (permissions: string[]) => {
    const userPerms = get().permissions;
    return permissions.some((p) => userPerms.includes(p));
  },
}));
