import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { ShieldAlert, Home } from "lucide-react";

export const Unauthorized: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center my-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm">
      <div className="p-4 bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-3xl mb-4">
        <ShieldAlert className="w-12 h-12" />
      </div>
      <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
        403 - Unauthorized Access
      </h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md">
        You do not have the required permissions to access this module or feature.
      </p>
      <Link to="/" className="mt-6">
        <Button leftIcon={<Home className="w-4 h-4" />}>Return to Dashboard</Button>
      </Link>
    </div>
  );
};
