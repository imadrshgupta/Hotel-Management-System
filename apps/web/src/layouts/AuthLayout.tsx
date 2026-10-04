import React from "react";
import { Outlet } from "react-router-dom";
import { ToastContainer } from "@/components/ui/ToastContainer";
import { Hotel } from "lucide-react";

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Glow Effect */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md z-10">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-xl shadow-blue-500/30 mb-3">
            <Hotel className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Grand Suite HMS
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Enterprise Hotel Operations & Management System
          </p>
        </div>

        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl">
          <Outlet />
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          &copy; {new Date().getFullYear()} Grand Suite HMS. All rights reserved.
        </p>
      </div>

      <ToastContainer />
    </div>
  );
};
