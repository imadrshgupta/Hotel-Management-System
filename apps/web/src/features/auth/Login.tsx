import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLogin } from "@/hooks/useAuth";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { Link } from "react-router-dom";
import { Mail, Lock, LogIn } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      // Demo credentials matching the API seeder (apps/api seeders/demo-data)
      email: "admin@grandhotel.com",
      password: "admin123",
    },
  });

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white">Sign In to Dashboard</h2>
        <p className="text-xs text-slate-400 mt-1">
          Enter your credentials to access hotel operational management.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField label="Email Address" error={errors.email?.message} required>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="email"
              {...register("email")}
              placeholder="staff@hotel.com"
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </FormField>

        <FormField label="Password" error={errors.password?.message} required>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="password"
              {...register("password")}
              placeholder="••••••••"
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </FormField>

        <div className="flex items-center justify-between text-xs pt-1">
          <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
            <input type="checkbox" className="rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500" />
            <span>Remember me</span>
          </label>
          <Link
            to="/forgot-password"
            className="text-blue-400 hover:underline font-semibold"
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          isLoading={loginMutation.isPending}
          leftIcon={<LogIn className="w-4 h-4" />}
          className="w-full mt-4"
        >
          Sign In
        </Button>
      </form>
    </div>
  );
};
