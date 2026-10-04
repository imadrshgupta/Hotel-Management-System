import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "./Button";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Something went wrong",
  message = "An unexpected error occurred while loading this data.",
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-2xl">
      <div className="p-3 bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 rounded-2xl mb-3">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h3 className="text-base font-semibold text-rose-900 dark:text-rose-200">{title}</h3>
      <p className="text-sm text-rose-700 dark:text-rose-300 mt-1 max-w-md">{message}</p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          className="mt-4 border-rose-300 text-rose-800 hover:bg-rose-100"
        >
          Try Again
        </Button>
      )}
    </div>
  );
};
