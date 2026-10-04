import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { reservationsApi, staysApi, roomTypesApi, roomsApi } from "@/services/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { RoomSelector } from "@/components/ui/RoomSelector";
import { useAppStore } from "@/store/app.store";
import { walkInSchema, type WalkInFormData } from "@/lib/validation";
import { Footprints, CheckCircle2, User, Key } from "lucide-react";
import type { Room } from "@/types";

export const WalkIn: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const addToast = useAppStore((s) => s.addToast);

  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<WalkInFormData>({
    resolver: zodResolver(walkInSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      id_type: "Passport",
      id_number: "",
      check_in_date: today,
      check_out_date: tomorrow,
      adults: 1,
      advance_paid: 0,
    },
  });

  const { data: roomTypes } = useQuery({
    queryKey: ["room-types"],
    queryFn: () => roomTypesApi.list({ is_active: true }),
  });

  const walkInMutation = useMutation({
    mutationFn: async (data: WalkInFormData) => {
      // 1. Create reservation
      const reservation = await reservationsApi.create({
        check_in_date: data.check_in_date,
        check_out_date: data.check_out_date,
        adults: data.adults,
        room_type_id: selectedRoom?.room_type_id || "",
        guest: {
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email || undefined,
          phone: data.phone || undefined,
          id_type: data.id_type || undefined,
          id_number: data.id_number || undefined,
        },
        advance_paid: data.advance_paid,
        source: "WALK_IN",
      });

      // 2. Check in guest to selected room immediately
      if (selectedRoom?.id && reservation?.id) {
        await staysApi.checkIn({
          reservation_id: reservation.id,
          room_id: selectedRoom.id,
          guest_id: (reservation as any).guests?.[0]?.guest_id || "",
        });
      }
      return reservation;
    },
    onSuccess: () => {
      addToast("Walk-in check-in completed successfully!", "success");
      queryClient.invalidateQueries({ queryKey: ["stays"] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      navigate("/front-office/in-house");
    },
    onError: (err: any) => {
      addToast(err?.response?.data?.message || "Walk-in process failed", "error");
    },
  });

  const onSubmit = (data: WalkInFormData) => {
    if (!selectedRoom) {
      addToast("Please select an available room.", "warning");
      return;
    }
    walkInMutation.mutate(data);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Walk-In Registration & Check-In"
        subtitle="Fast-track walk-in booking and immediate room check-in."
        breadcrumbs={[{ label: "Front Office" }, { label: "Walk-in" }]}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Step 1: Guest Personal Info */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" />
            Guest Personal Details
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

            <FormField label="Email" error={errors.email?.message}>
              <input
                type="email"
                {...register("email")}
                placeholder="guest@example.com"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </FormField>

            <FormField label="Phone Number">
              <input
                type="tel"
                {...register("phone")}
                placeholder="+1 555-0192"
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

            <FormField label="ID Document Number">
              <input
                type="text"
                {...register("id_number")}
                placeholder="A12345678"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </FormField>
          </div>
        </div>

        {/* Step 2: Room Selection */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Key className="w-4 h-4 text-blue-600" />
            Select Room & Dates
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

            <FormField label="Advance Paid">
              <Controller
                name="advance_paid"
                control={control}
                render={({ field }) => (
                  <CurrencyInput value={field.value || 0} onChange={field.onChange} />
                )}
              />
            </FormField>
          </div>

          <FormField
            label="Available Clean Rooms"
            required
            helpText={selectedRoom ? `Selected: Room ${selectedRoom.number} — ${selectedRoom.roomType?.name || ""}` : undefined}
          >
            <RoomSelector
              selectedRoomId={selectedRoom?.id}
              statusFilter="VACANT_CLEAN"
              onSelect={setSelectedRoom}
            />
          </FormField>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" type="button" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={walkInMutation.isPending}
            leftIcon={<CheckCircle2 className="w-4 h-4" />}
          >
            Complete Walk-In Check-In
          </Button>
        </div>
      </form>
    </div>
  );
};