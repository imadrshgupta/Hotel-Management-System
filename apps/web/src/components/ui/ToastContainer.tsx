import React from "react";
import { useAppStore } from "@/store/app.store";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useAppStore();

  if (toasts.length === 0) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />,
  };

  const borders = {
    success: "border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/90 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-200",
    error: "border-rose-200 dark:border-rose-900/50 bg-rose-50/90 dark:bg-rose-950/80 text-rose-900 dark:text-rose-200",
    warning: "border-amber-200 dark:border-amber-900/50 bg-amber-50/90 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200",
    info: "border-blue-200 dark:border-blue-900/50 bg-blue-50/90 dark:bg-blue-950/80 text-blue-900 dark:text-blue-200",
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center justify-between p-4 rounded-xl border shadow-lg backdrop-blur-xs transition-all duration-300 animate-slide-in ${
            borders[toast.type]
          }`}
        >
          <div className="flex items-center gap-3">
            {icons[toast.type]}
            <p className="text-sm font-medium">{toast.message}</p>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="p-1 rounded-lg opacity-70 hover:opacity-100 transition-opacity ml-3"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
