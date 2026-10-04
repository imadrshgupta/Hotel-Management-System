import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { roomTypesApi } from "@/services/api";
import { DataTable, Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { FormField } from "@/components/ui/FormField";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useAppStore } from "@/store/app.store";
import { roomTypeFormSchema, type RoomTypeFormData } from "@/lib/validation";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { RoomType } from "@/types";

const EMPTY_FORM: RoomTypeFormData = {
  name: "",
  code: "",
  description: "",
  base_rate: 0,
  max_occupancy: 2,
  max_adults: 2,
  max_children: 0,
  bed_count: 1,
  bed_type: "QUEEN",
  is_active: true,
};

const BED_TYPES = ["SINGLE", "DOUBLE", "QUEEN", "KING", "TWIN", "FUTON", "SOFA_BED"];

export const SettingsRoomTypes: React.FC = () => {
  const queryClient = useQueryClient();
  const addToast = useAppStore((s) => s.addToast);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<RoomType | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RoomType | null>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RoomTypeFormData>({
    resolver: zodResolver(roomTypeFormSchema),
    defaultValues: EMPTY_FORM,
  });

  const { data: roomTypes, isLoading, isError } = useQuery({
    queryKey: ["room-types", "settings"],
    queryFn: () => roomTypesApi.list(),
  });

  const createMutation = useMutation({
    mutationFn: roomTypesApi.create,
    onSuccess: () => {
      addToast("Room type created successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["room-types"] });
      setModalOpen(false);
      reset(EMPTY_FORM);
    },
    onError: (err: any) =>
      addToast(err?.response?.data?.message || "Failed to create room type", "error"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => roomTypesApi.update(id, data),
    onSuccess: () => {
      addToast("Room type updated successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["room-types"] });
      setModalOpen(false);
      reset(EMPTY_FORM);
    },
    onError: (err: any) =>
      addToast(err?.response?.data?.message || "Failed to update room type", "error"),
  });

  const deleteMutation = useMutation({
    mutationFn: roomTypesApi.delete,
    onSuccess: () => {
      addToast("Room type deleted", "info");
      queryClient.invalidateQueries({ queryKey: ["room-types"] });
      setDeleteTarget(null);
    },
    onError: (err: any) =>
      addToast(err?.response?.data?.message || "Failed to delete room type", "error"),
  });

  const openCreate = () => {
    setEditing(null);
    reset(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (rt: RoomType) => {
    setEditing(rt);
    reset({
      name: rt.name,
      code: rt.code,
      description: rt.description || "",
      base_rate: rt.base_rate,
      max_occupancy: rt.max_occupancy,
      max_adults: rt.max_adults,
      max_children: rt.max_children,
      bed_count: rt.bed_count,
      bed_type: rt.bed_type || "QUEEN",
      is_active: rt.is_active,
    });
    setModalOpen(true);
  };

  const onSubmit = (form: RoomTypeFormData) => {
    const payload: any = {
      name: form.name.trim(),
      code: form.code.trim().toUpperCase(),
      description: form.description?.trim() || undefined,
      base_rate: form.base_rate,
      max_occupancy: form.max_occupancy,
      max_adults: form.max_adults,
      max_children: form.max_children,
      bed_count: form.bed_count,
      bed_type: form.bed_type,
      is_active: !!form.is_active,
    };
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const list: RoomType[] = roomTypes || [];

  const columns: Column<RoomType>[] = [
    {
      header: "Name",
      cell: (rt) => <span className="font-bold text-slate-900 dark:text-white">{rt.name}</span>,
    },
    {
      header: "Code",
      cell: (rt) => <span className="font-mono text-xs">{rt.code}</span>,
    },
    {
      header: "Base Rate",
      cell: (rt) => formatCurrency(rt.base_rate),
    },
    {
      header: "Occupancy",
      cell: (rt) => `${rt.max_adults} A / ${rt.max_children} C (max ${rt.max_occupancy})`,
    },
    {
      header: "Beds",
      cell: (rt) => `${rt.bed_count}x ${rt.bed_type || "—"}`,
    },
    {
      header: "Status",
      cell: (rt) => (
        <StatusBadge status={rt.is_active ? "ACTIVE" : "INACTIVE"} type="generic" size="sm" />
      ),
    },
    {
      header: "Actions",
      cell: (rt) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => openEdit(rt)}
            className="p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            title="Edit room type"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteTarget(rt)}
            className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg"
            title="Delete room type"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Room Types</h3>
          <p className="text-xs text-slate-500">Categories, rates, and occupancy rules.</p>
        </div>
        <Button size="sm" onClick={openCreate} leftIcon={<Plus className="w-4 h-4" />}>
          Add Room Type
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={list}
        isLoading={isLoading}
        isError={isError}
        emptyTitle="No room types found"
        emptyMessage="Create a room type before adding rooms."
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? `Edit Room Type — ${editing.name}` : "Add New Room Type"}
        size="md"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              isLoading={createMutation.isPending || updateMutation.isPending}
              onClick={handleSubmit(onSubmit)}
            >
              {editing ? "Save Changes" : "Create Room Type"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Name" required error={errors.name?.message}>
              <input
                type="text"
                {...register("name")}
                placeholder="e.g. Deluxe King"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </FormField>
            <FormField label="Code" required error={errors.code?.message}>
              <input
                type="text"
                {...register("code")}
                placeholder="e.g. DLX-K"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </FormField>
          </div>

          <FormField label="Description">
            <textarea
              rows={2}
              {...register("description")}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
            />
          </FormField>

          <FormField label="Base Rate / Night" required error={errors.base_rate?.message}>
            <Controller
              name="base_rate"
              control={control}
              render={({ field }) => (
                <CurrencyInput value={field.value || 0} onChange={field.onChange} />
              )}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Max Adults">
              <input
                type="number"
                min="0"
                {...register("max_adults")}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </FormField>
            <FormField label="Max Children">
              <input
                type="number"
                min="0"
                {...register("max_children")}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </FormField>
            <FormField label="Max Occupancy">
              <input
                type="number"
                min="0"
                {...register("max_occupancy")}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </FormField>
            <FormField label="Bed Count">
              <input
                type="number"
                min="0"
                {...register("bed_count")}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </FormField>
            <FormField label="Bed Type">
              <select
                {...register("bed_type")}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              >
                {BED_TYPES.map((b) => (
                  <option key={b} value={b}>
                    {b.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
            <input type="checkbox" {...register("is_active")} className="rounded" />
            Active (available for bookings)
          </label>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        title="Delete room type?"
        message={`${deleteTarget?.name} will be removed. Rooms assigned to this type may become invalid.`}
        confirmText="Delete Room Type"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};