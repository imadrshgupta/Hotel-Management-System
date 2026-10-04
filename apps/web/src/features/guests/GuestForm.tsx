import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { guestsApi } from "@/services/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { useAppStore } from "@/store/app.store";
import { guestSchema, type GuestFormData } from "@/lib/validation";
import { User, CheckCircle2 } from "lucide-react";

export const GuestForm: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const addToast = useAppStore((s) => s.addToast);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GuestFormData>({
    resolver: zodResolver(guestSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      nationality: "",
      id_type: "Passport",
      id_number: "",
      is_vip: false,
      notes: "",
    },
  });

  const createGuestMutation = useMutation({
    mutationFn: guestsApi.create,
    onSuccess: (data) => {
      addToast("Guest profile created successfully!", "success");
      queryClient.invalidateQueries({ queryKey: ["guests"] });
      navigate(`/guests/${data.id}`);
    },
    onError: (err: any) => {
      addToast(err?.response?.data?.message || "Failed to create guest profile", "error");
    },
  });

  const onSubmit = (data: GuestFormData) => {
    createGuestMutation.mutate({
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email || undefined,
      phone: data.phone || undefined,
      nationality: data.nationality || undefined,
      id_type: data.id_type || undefined,
      id_number: data.id_number || undefined,
      vip_status: data.is_vip ? "VIP" : null,
      notes: data.notes || undefined,
    });
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <PageHeader
        title="Add New Guest Profile"
        subtitle="Register guest details in CRM database."
        breadcrumbs={[
          { label: "Guests", path: "/guests" },
          { label: "New Guest Profile" },
        ]}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" />
            Guest Profile Data
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="First Name" required error={errors.first_name?.message}>
              <input
                type="text"
                {...register("first_name")}
                placeholder="John"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </FormField>

            <FormField label="Last Name" required error={errors.last_name?.message}>
              <input
                type="text"
                {...register("last_name")}
                placeholder="Doe"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </FormField>

            <FormField label="Email Address" error={errors.email?.message}>
              <input
                type="email"
                {...register("email")}
                placeholder="john@example.com"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </FormField>

            <FormField label="Phone Number">
              <input
                type="tel"
                {...register("phone")}
                placeholder="+1 555-0199"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </FormField>

            <FormField label="Nationality">
              <input
                type="text"
                {...register("nationality")}
                placeholder="American"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </FormField>

            <FormField label="ID Document Type">
              <select
                {...register("id_type")}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              >
                <option value="Passport">Passport</option>
                <option value="Driver License">Driver License</option>
                <option value="National ID">National ID</option>
              </select>
            </FormField>

            <FormField label="ID Number">
              <input
                type="text"
                {...register("id_number")}
                placeholder="A12345678"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </FormField>

            <div className="flex items-center gap-2 pt-6">
              <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  {...register("is_vip")}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>Mark as VIP Guest</span>
              </label>
            </div>
          </div>

          <FormField label="Special Preferences / Notes">
            <textarea
              rows={2}
              {...register("notes")}
              placeholder="High floor, feather pillows, allergic to nuts..."
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
            />
          </FormField>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" type="button" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={createGuestMutation.isPending}
            leftIcon={<CheckCircle2 className="w-4 h-4" />}
          >
            Save Profile
          </Button>
        </div>
      </form>
    </div>
  );
};