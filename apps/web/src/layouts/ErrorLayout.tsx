import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { AlertCircle, Home } from "lucide-react";

export const ErrorLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
      <div className="p-4 bg-rose-900/30 text-rose-400 rounded-3xl mb-4">
        <AlertCircle className="w-12 h-12" />
      </div>
      <h1 className="text-4xl font-extrabold text-white">404 - Page Not Found</h1>
      <p className="text-sm text-slate-400 mt-2 max-w-md">
        The requested page does not exist or you do not have permission to view it.
      </p>
      <Link to="/" className="mt-6">
        <Button leftIcon={<Home className="w-4 h-4" />}>Back to Dashboard</Button>
      </Link>
    </div>
  );
};
