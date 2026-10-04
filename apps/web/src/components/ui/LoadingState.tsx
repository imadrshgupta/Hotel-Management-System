import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = "Loading...",
  className = "",
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center text-slate-500 dark:text-slate-400 ${className}`}>
      <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400 mb-3" />
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
};
