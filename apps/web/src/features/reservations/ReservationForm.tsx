import React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { reservationsApi, roomTypesApi } from "@/services/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { BOOKING_SOURCES } from "@/constants";
import { useAppStore } from "@/store/app.store";
import { reservationSchema, type ReservationFormData } from "@/lib/validation";
import { Calendar, User, CheckCircle2 } from "lucide-react";

export const ReservationForm: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const addToast = useAppStore((s) => s.addToast);

  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ReservationFormData>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      room_type_id: "",
      check_in_date: today,
      check_out_date: tomorrow,
      adults: 1,
      children: 0,
      source: "DIRECT",
      advance_paid: 0,
      special_requests: "",
    },
  });

  const { data: roomTypes } = useQuery({
    queryKey: ["room-types"],
    queryFn: () => roomTypesApi.list({ is_active: true }),
  });

  const createReservationMutation = useMutation({
    mutationFn: reservationsApi.create,
    onSuccess: (data) => {
      addToast("Reservation created successfully!", "success");
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
      navigate(`/reservations/${data.id}`);
    },
    onError: (err: any) => {
      addToast(err?.response?.data?.message || "Failed to create reservation", "error");
    },
  });

  const onSubmit = (data: ReservationFormData) => {
    createReservationMutation.mutate({
      check_in_date: data.check_in_date,
      check_out_date: data.check_out_date,
      adults: data.adults,
      children: data.children,
      room_type_id: data.room_type_id,
      guest: {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email || undefined,
        phone: data.phone || undefined,
      },
      advance_paid: data.advance_paid,
      source: data.source,
      special_requests: data.special_requests,
    });
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <PageHeader
        title="Create New Reservation"
        subtitle="Book room types and reserve dates for guests."
        breadcrumbs={[
          { label: "Reservations", path: "/reservations" },
          { label: "New Reservation" },
        ]}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Guest Details */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" />
            Guest Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="First Name" required error={errors.first_name?.message}>
              <input
                type="text"
                {...register("first_name")}
                placeholder="Jane"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </FormField>
            <FormField label="Last Name" required error={errors.last_name?.message}>
              <input
                type="text"
                {...register("last_name")}
                placeholder="Smith"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </FormField>
            <FormField label="Email" error={errors.email?.message}>
              <input
                type="email"
                {...register("email")}
                placeholder="jane@example.com"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </FormField>
            <FormField label="Phone">
              <input
                type="tel"
                {...register("phone")}
                placeholder="+1 555-0182"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </FormField>
          </div>
        </div>

        {/* Reservation Options */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            Stay Details & Rates
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Room Type" required error={errors.room_type_id?.message}>
              <select
                {...register("room_type_id")}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              >
                <option value="">Select Room Type</option>
                {roomTypes?.map((rt) => (
                  <option key={rt.id} value={rt.id}>
                    {rt.name} (${rt.base_rate}/night)
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Booking Source">
              <select
                {...register("source")}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              >
                {BOOKING_SOURCES.map((src) => (
                  <option key={src} value={src}>
                    {src}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Check-in Date" required error={errors.check_in_date?.message}>
              <input
                type="date"
                {...register("check_in_date")}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </FormField>

            <FormField label="Check-out Date" required error={errors.check_out_date?.message}>
              <input
                type="date"
                {...register("check_out_date")}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </FormField>

            <FormField label="Adults" error={errors.adults?.message}>
              <input
                type="number"
                min="1"
                {...register("adults")}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </FormField>

            <FormField label="Children" error={errors.children?.message}>
              <input
                type="number"
                min="0"
                {...register("children")}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </FormField>

            <FormField label="Advance Payment Received">
              <Controller
                name="advance_paid"
                control={control}
                render={({ field }) => (
                  <CurrencyInput value={field.value || 0} onChange={field.onChange} />
                )}
              />
            </FormField>
          </div>

          <FormField label="Special Requests / Notes">
            <textarea
              rows={2}
              {...register("special_requests")}
              placeholder="High floor, quiet room, late check-in..."
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
            isLoading={createReservationMutation.isPending}
            leftIcon={<CheckCircle2 className="w-4 h-4" />}
          >
            Save Reservation
          </Button>
        </div>
      </form>
    </div>
  );
};