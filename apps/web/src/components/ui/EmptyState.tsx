import React from "react";
import { FolderOpen } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  message?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No data found",
  message = "There are no records to display at this time.",
  action,
  icon,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
      <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-400 dark:text-slate-500 mb-3">
        {icon || <FolderOpen className="w-8 h-8" />}
      </div>
      <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};
