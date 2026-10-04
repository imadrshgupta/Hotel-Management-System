import React, { useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import { useAppStore } from "@/store/app.store";
import { useLogout } from "@/hooks/useAuth";
import { GlobalSearch } from "@/components/layout/GlobalSearch";
import { NotificationsDropdown } from "@/components/layout/NotificationsDropdown";
import { useNotifications } from "@/hooks/useNotifications";
import {
  Menu,
  Sun,
  Moon,
  LogOut,
  User as UserIcon,
  Building,
  ChevronDown,
  Sparkles,
} from "lucide-react";

export const Topbar: React.FC = () => {
  const { user, propertyId } = useAuthStore();
  const { toggleSidebar, sidebarCollapsed, setSidebarCollapsed } = useAppStore();
  const logoutMutation = useLogout();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Subscribe to real-time backend notifications for the bell tray
  useNotifications();

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      return next;
    });
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar */}
        <div className="hidden sm:block w-72 lg:w-96">
          <GlobalSearch />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Toggle Theme"
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Notification Bell */}
        <NotificationsDropdown />

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen((prev) => !prev)}
            className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-blue-500/20">
              {user?.first_name?.[0] || "U"}
              {user?.last_name?.[0] || ""}
            </div>
            <div className="hidden md:block">
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                {user?.roles?.[0]?.name || "Front Desk Manager"}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-2 z-50 animate-scale-in">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    logoutMutation.mutate();
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
