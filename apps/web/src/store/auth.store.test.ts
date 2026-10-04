import { describe, it, expect, beforeEach } from "vitest";
import { useAuthStore } from "./auth.store";
import type { User, Role, Permission } from "@/types";

function makeUser(permissionSlugs: string[]): User {
  const permissions: Permission[] = permissionSlugs.map((slug, i) => ({
    id: `perm-${i}`,
    name: slug,
    slug,
    module: "test",
    action: "view",
    description: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));

  const role: Role = {
    id: "role-1",
    organization_id: null,
    name: "Test Role",
    slug: "test-role",
    description: null,
    is_system: false,
    is_active: true,
    permissions,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return {
    id: "user-1",
    organization_id: "org-1",
    email: "staff@example.com",
    first_name: "Front",
    last_name: "Desk",
    phone: null,
    avatar_url: null,
    is_active: true,
    is_email_verified: true,
    last_login_at: null,
    password_changed_at: null,
    roles: [role],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

beforeEach(() => {
  localStorage.clear();
  useAuthStore.setState({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    propertyId: null,
    organizationId: null,
    permissions: [],
  });
});

describe("auth store — permissions", () => {
  it("extracts permissions from the user's roles on setUser", () => {
    useAuthStore.getState().setUser(makeUser(["reservation.view", "billing.create"]));
    expect(useAuthStore.getState().permissions).toEqual([
      "reservation.view",
      "billing.create",
    ]);
  });

  it("hasPermission returns true only for granted permissions", () => {
    useAuthStore.getState().setUser(makeUser(["reservation.view"]));
    const { hasPermission } = useAuthStore.getState();
    expect(hasPermission("reservation.view")).toBe(true);
    expect(hasPermission("billing.create")).toBe(false);
    expect(hasPermission("settings.view")).toBe(false);
  });

  it("hasAnyPermission returns true when at least one matches", () => {
    useAuthStore.getState().setUser(makeUser(["guest.view"]));
    const { hasAnyPermission } = useAuthStore.getState();
    expect(hasAnyPermission(["settings.view", "guest.view"])).toBe(true);
    expect(hasAnyPermission(["pos.view", "report.view"])).toBe(false);
  });

  it("users without roles have no permissions", () => {
    useAuthStore.getState().setUser(makeUser([]));
    expect(useAuthStore.getState().hasPermission("reservation.view")).toBe(false);
  });
});

describe("auth store — session", () => {
  it("setTokens persists tokens to localStorage", () => {
    useAuthStore.getState().setTokens("access-123", "refresh-456");
    expect(localStorage.getItem("accessToken")).toBe("access-123");
    expect(localStorage.getItem("refreshToken")).toBe("refresh-456");
  });

  it("logout clears session state and storage", () => {
    useAuthStore.getState().setTokens("access-123", "refresh-456");
    useAuthStore.getState().setUser(makeUser(["guest.view"]));
    useAuthStore.getState().logout();

    expect(localStorage.getItem("accessToken")).toBeNull();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().permissions).toEqual([]);
  });
});