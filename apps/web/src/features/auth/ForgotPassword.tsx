import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { Mail, ArrowLeft } from "lucide-react";

export const ForgotPassword: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white">Reset Password</h2>
        <p className="text-xs text-slate-400 mt-1">
          Enter your registered email address to receive password reset instructions.
        </p>
      </div>

      {submitted ? (
        <div className="bg-blue-950/40 border border-blue-900/60 rounded-2xl p-4 text-center">
          <p className="text-sm font-semibold text-blue-200">Reset instructions sent!</p>
          <p className="text-xs text-slate-400 mt-1">
            Check your inbox for instructions to reset your password.
          </p>
          <Link to="/login" className="block mt-4">
            <Button variant="outline" size="sm" className="w-full">
              Return to Sign In
            </Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Email Address" required>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="staff@hotel.com"
                required
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </FormField>

          <Button type="submit" className="w-full">
            Send Reset Instructions
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
      )}
    </div>
  );
};
