import { create } from "zustand";

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
}

interface AppState {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  toasts: Toast[];

  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  addToast: (message: string, type?: Toast["type"]) => void;
  removeToast: (id: string) => void;
}

let toastCounter = 0;

export const useAppStore = create<AppState>((set) => ({
  sidebarOpen: true,
  sidebarCollapsed: false,
  toasts: [],

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),

  setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),

  addToast: (message, type = "info") => {
    const id = `toast-${++toastCounter}`;
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }],
    }));
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 5000);
  },

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));
