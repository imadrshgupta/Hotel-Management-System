import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";
import { useAppStore } from "@/store/app.store";
import { wsClient } from "@/lib/websocket";
import { ROUTES } from "@/constants";

export function useLogin() {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);
  const setTokens = useAuthStore((s) => s.setTokens);
  const addToast = useAppStore((s) => s.addToast);

  return useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      const accessToken = data.accessToken || data.tokens?.accessToken;
      const refreshToken = data.refreshToken || data.tokens?.refreshToken;
      if (accessToken && refreshToken) {
        setTokens(accessToken, refreshToken);
      }
      setUser(data.user);
      wsClient.connect();
      navigate(ROUTES.DASHBOARD);
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || "Invalid email or password";
      addToast(message, "error");
    },
  });
}

export function useLogout() {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const addToast = useAppStore((s) => s.addToast);

  return useMutation({
    mutationFn: async () => {
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    },
    onSettled: () => {
      wsClient.disconnect();
      logout();
      navigate(ROUTES.LOGIN);
    },
    onError: () => {
      wsClient.disconnect();
      logout();
      navigate(ROUTES.LOGIN);
    },
  });
}

export function useProfile() {
  const setUser = useAuthStore((s) => s.setUser);
  const setLoading = useAuthStore((s) => s.setLoading);

  return useQuery({
    queryKey: ["auth", "profile"],
    queryFn: async () => {
      const user = await authService.getProfile();
      setUser(user);
      return user;
    },
    retry: false,
    staleTime: 5 * 60_000,
  });
}

export function useChangePassword() {
  const addToast = useAppStore((s) => s.addToast);

  return useMutation({
    mutationFn: authService.changePassword,
    onSuccess: () => {
      addToast("Password changed successfully", "success");
    },
    onError: (error: any) => {
      addToast(error?.response?.data?.message || "Failed to change password", "error");
    },
  });
}

export function useRequireAuth() {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  return { user, isAuthenticated, isLoading };
}

export function useRequirePermission(permission: string) {
  const hasPermission = useAuthStore((s) => s.hasPermission);
  return hasPermission(permission);
}
