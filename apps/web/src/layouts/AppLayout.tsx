import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { ToastContainer } from "@/components/ui/ToastContainer";
import { useAppStore } from "@/store/app.store";
import { useAuthStore } from "@/store/auth.store";
import { wsClient } from "@/lib/websocket";

export const AppLayout: React.FC = () => {
  const { sidebarCollapsed } = useAppStore();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // (Re)connect the WebSocket whenever an authenticated session is present,
  // e.g. after a page refresh with persisted tokens.
  useEffect(() => {
    if (isAuthenticated) {
      wsClient.connect();
    }
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      <Sidebar />
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          sidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
        }`}
      >
        <Topbar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
      <ToastContainer />
    </div>
  );
};
