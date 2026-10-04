import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { Lock, ArrowLeft } from "lucide-react";
import { useAppStore } from "@/store/app.store";

export const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const navigate = useNavigate();
  const addToast = useAppStore((s) => s.addToast);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      addToast("Passwords do not match", "error");
      return;
    }
    addToast("Password reset successfully. Please sign in.", "success");
    navigate("/login");
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white">Set New Password</h2>
        <p className="text-xs text-slate-400 mt-1">
          Please enter your new password below.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="New Password" required>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </FormField>

        <FormField label="Confirm Password" required>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </FormField>

        <Button type="submit" className="w-full">
          Update Password
        </Button>

        <div className="text-center pt-2">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Sign In
          </Link>
        </div>
      </form>
    </div>
  );
};
