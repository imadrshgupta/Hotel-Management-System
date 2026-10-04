import { create } from "zustand";

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  referenceType?: string | null;
  referenceId?: string | null;
}

interface NotificationState {
  notifications: AppNotification[];
  push: (notification: Omit<AppNotification, "createdAt" | "isRead"> & { id?: string }) => void;
  markAllRead: () => void;
  clear: () => void;
  unreadCount: () => number;
}

let notificationCounter = 0;

/**
 * Client-side tray fed exclusively by real WebSocket `notification` events
 * (backend broadcasts to the user/property room). It stays empty until the
 * backend emits — no fake notifications are ever rendered.
 */
export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],

  push: (notification) => {
    notificationCounter += 1;
    set((state) => ({
      notifications: [
        {
          ...notification,
          id: notification.id || `notif-${Date.now()}-${notificationCounter}`,
          createdAt: new Date().toISOString(),
          isRead: false,
        },
        ...state.notifications,
      ].slice(0, 50), // keep the tray bounded
    }));
  },

  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
    })),

  clear: () => set({ notifications: [] }),

  unreadCount: () =>
    get().notifications.filter((n) => !n.isRead).length,
}));