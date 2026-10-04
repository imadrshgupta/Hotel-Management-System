import React, { useEffect, useRef, useState } from "react";
import { useNotificationStore } from "@/store/notification.store";
import { Bell, CheckCheck, Trash2, BellOff } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

export const NotificationsDropdown: React.FC = () => {
  const { notifications, markAllRead, clear, unreadCount } = useNotificationStore();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const unread = unreadCount();

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        title="Notifications"
        aria-label={`Notifications${unread ? ` (${unread} unread)` : ""}`}
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute top-1.5 right-1.5 min-w-4 h-4 px-1 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-scale-in">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
            <p className="text-xs font-bold text-slate-900 dark:text-white">
              Notifications
              {unread > 0 && (
                <span className="ml-2 text-[10px] font-semibold text-blue-600 dark:text-blue-400">
                  {unread} new
                </span>
              )}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={markAllRead}
                disabled={notifications.length === 0}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
                title="Mark all as read"
              >
                <CheckCheck className="w-4 h-4" />
              </button>
              <button
                onClick={clear}
                disabled={notifications.length === 0}
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 disabled:opacity-40"
                title="Clear all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 flex flex-col items-center text-center">
                <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-400 mb-2">
                  <BellOff className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  No notifications yet
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Real-time alerts (reservations, check-ins, payments…) will appear here.
                </p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`px-4 py-3 border-b border-slate-50 dark:border-slate-800/60 last:border-b-0 ${
                    n.isRead ? "" : "bg-blue-50/50 dark:bg-blue-950/20"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span
                      className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${
                        n.isRead ? "bg-slate-300 dark:bg-slate-700" : "bg-blue-600"
                      }`}
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {n.title}
                      </p>
                      {n.message && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                          {n.message}
                        </p>
                      )}
                      <p className="text-[10px] text-slate-400 mt-1">
                        {formatDateTime(n.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};