import React, { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { propertiesApi } from "@/services/api";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { useAppStore } from "@/store/app.store";
import { Building, CheckCircle2 } from "lucide-react";
import type { Property } from "@/types";

const CURRENCIES = ["USD", "EUR", "GBP", "INR", "AED", "SGD", "JPY", "AUD"];

export const PropertySettings: React.FC = () => {
  const queryClient = useQueryClient();
  const addToast = useAppStore((s) => s.addToast);

  const [form, setForm] = useState<{
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    country: string;
    currency: string;
    timezone: string;
    tax_id: string;
    check_in_time: string;
    check_out_time: string;
  } | null>(null);

  // Load the current property (the one selected via X-Property-ID)
  const { data: properties, isLoading, isError, refetch } = useQuery({
    queryKey: ["properties"],
    queryFn: () => propertiesApi.list({ limit: 50 }),
  });

  const currentPropertyId = localStorage.getItem("propertyId");
  const propertyList: Property[] = properties?.data || [];
  const current: Property | undefined =
    propertyList.find((p) => p.id === currentPropertyId) || propertyList[0];

  // Seed the form once the property loads
  useEffect(() => {
    if (current && !form) {
      setForm({
        name: current.name,
        email: current.email,
        phone: current.phone || "",
        address: current.address || "",
        city: current.city || "",
        country: current.country || "",
        currency: current.currency || "USD",
        timezone: current.timezone || "UTC",
        tax_id: current.tax_id || "",
        check_in_time: current.check_in_time || "14:00",
        check_out_time: current.check_out_time || "11:00",
      });
    }
  }, [current, form]);

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => propertiesApi.update(id, data),
    onSuccess: () => {
      addToast("Property settings saved successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
    onError: (err: any) =>
      addToast(err?.response?.data?.message || "Failed to save property settings", "error"),
  });

  if (isLoading) return <LoadingState message="Loading property configuration..." />;
  if (isError)
    return <ErrorState title="Failed to load property" onRetry={refetch} />;
  if (!current || !form) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      addToast("Property name and email are required", "warning");
      return;
    }
    updateMutation.mutate({
      id: current.id,
      data: {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        address: form.address.trim() || null,
        city: form.city.trim() || null,
        country: form.country.trim() || null,
        currency: form.currency,
        timezone: form.timezone,
        tax_id: form.tax_id.trim() || null,
        check_in_time: form.check_in_time,
        check_out_time: form.check_out_time,
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-4 max-w-2xl">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
          <Building className="w-4 h-4 text-blue-600" />
          Property Configuration
        </h3>
        <span className="text-[11px] font-mono text-slate-400">{current.id}</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Property Name" required>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
          />
        </FormField>
        <FormField label="Contact Email" required>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
          />
        </FormField>
        <FormField label="Phone">
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
          />
        </FormField>
        <FormField label="Tax ID / GST">
          <input
            type="text"
            value={form.tax_id}
            onChange={(e) => setForm({ ...form, tax_id: e.target.value })}
            className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
          />
        </FormField>
        <FormField label="Currency">
          <select
            value={form.currency}
            onChange={(e) => setForm({ ...form, currency: e.target.value })}
            className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Timezone">
          <input
            type="text"
            value={form.timezone}
            onChange={(e) => setForm({ ...form, timezone: e.target.value })}
            placeholder="e.g. UTC, Asia/Kolkata"
            className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
          />
        </FormField>
        <FormField label="Check-In Time">
          <input
            type="time"
            value={form.check_in_time}
            onChange={(e) => setForm({ ...form, check_in_time: e.target.value })}
            className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
          />
        </FormField>
        <FormField label="Check-Out Time">
          <input
            type="time"
            value={form.check_out_time}
            onChange={(e) => setForm({ ...form, check_out_time: e.target.value })}
            className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
          />
        </FormField>
      </div>

      <FormField label="Address">
        <input
          type="text"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
          className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
        />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="City">
          <input
            type="text"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
          />
        </FormField>
        <FormField label="Country">
          <input
            type="text"
            value={form.country}
            onChange={(e) => setForm({ ...form, country: e.target.value })}
            className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
          />
        </FormField>
      </div>

      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          isLoading={updateMutation.isPending}
          leftIcon={<CheckCircle2 className="w-4 h-4" />}
        >
          Save Changes
        </Button>
      </div>
    </form>
  );
};