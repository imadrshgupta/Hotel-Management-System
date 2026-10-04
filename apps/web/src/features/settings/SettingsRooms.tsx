import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { roomsApi, roomTypesApi, floorsApi } from "@/services/api";
import { DataTable, Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { FormField } from "@/components/ui/FormField";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { FilterBar } from "@/components/ui/FilterBar";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useAppStore } from "@/store/app.store";
import { useRealtimeInvalidate } from "@/hooks/useRealtimeInvalidate";
import { roomFormSchema, type RoomFormData } from "@/lib/validation";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { Room, RoomType, Floor } from "@/types";

const EMPTY_FORM: RoomFormData = {
  number: "",
  name: "",
  room_type_id: "",
  floor_id: "",
  rate_override: 0,
  is_smoking: false,
  is_accessible: false,
  has_balcony: false,
  notes: "",
};

export const SettingsRooms: React.FC = () => {
  const queryClient = useQueryClient();
  const addToast = useAppStore((s) => s.addToast);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Room | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Room | null>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RoomFormData>({
    resolver: zodResolver(roomFormSchema),
    defaultValues: EMPTY_FORM,
  });

  // Live updates: room status changes refresh the list
  useRealtimeInvalidate({
    "room:status_changed": [["rooms"]],
  });

  const { data: response, isLoading, isError } = useQuery({
    queryKey: ["rooms", "settings", search, page, limit],
    queryFn: () =>
      roomsApi.list({
        // Backend filters by room number (iLike), not "search"
        number: search || undefined,
        page,
        limit,
      }),
  });

  const { data: roomTypes } = useQuery({
    queryKey: ["room-types"],
    queryFn: () => roomTypesApi.list({ is_active: true }),
  });

  const { data: floors } = useQuery({
    queryKey: ["floors"],
    queryFn: () => floorsApi.list(),
  });

  const createMutation = useMutation({
    mutationFn: roomsApi.create,
    onSuccess: () => {
      addToast("Room created successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      setModalOpen(false);
      reset(EMPTY_FORM);
    },
    onError: (err: any) =>
      addToast(err?.response?.data?.message || "Failed to create room", "error"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => roomsApi.update(id, data),
    onSuccess: () => {
      addToast("Room updated successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      setModalOpen(false);
      reset(EMPTY_FORM);
    },
    onError: (err: any) =>
      addToast(err?.response?.data?.message || "Failed to update room", "error"),
  });

  const deleteMutation = useMutation({
    mutationFn: roomsApi.delete,
    onSuccess: () => {
      addToast("Room deleted", "info");
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      setDeleteTarget(null);
    },
    onError: (err: any) =>
      addToast(err?.response?.data?.message || "Failed to delete room", "error"),
  });

  const openCreate = () => {
    setEditing(null);
    reset(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (room: Room) => {
    setEditing(room);
    reset({
      number: room.number,
      name: room.name || "",
      room_type_id: room.room_type_id,
      floor_id: room.floor_id || "",
      rate_override: room.rate_override || 0,
      is_smoking: room.is_smoking,
      is_accessible: room.is_accessible,
      has_balcony: room.has_balcony,
      notes: room.notes || "",
    });
    setModalOpen(true);
  };

  const onSubmit = (form: RoomFormData) => {
    const payload: any = {
      number: form.number.trim(),
      name: form.name?.trim() || undefined,
      room_type_id: form.room_type_id,
      floor_id: form.floor_id || null,
      rate_override: form.rate_override && form.rate_override > 0 ? form.rate_override : null,
      is_smoking: !!form.is_smoking,
      is_accessible: !!form.is_accessible,
      has_balcony: !!form.has_balcony,
      notes: form.notes?.trim() || undefined,
    };
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const rooms: Room[] = response?.data || [];
  const pagination = response?.pagination || { page: 1, totalPages: 1, total: 0, limit };

  const columns: Column<Room>[] = [
    {
      header: "Room #",
      cell: (r) => <span className="font-bold text-slate-900 dark:text-white">{r.number}</span>,
    },
    {
      header: "Name",
      cell: (r) => r.name || "—",
    },
    {
      header: "Room Type",
      cell: (r) => r.roomType?.name || "—",
    },
    {
      header: "Floor",
      cell: (r) => r.floor?.name || "—",
    },
    {
      header: "Status",
      cell: (r) => <StatusBadge status={r.status} type="room" size="sm" />,
    },
    {
      header: "Rate Override",
      cell: (r) => (r.rate_override ? `$${r.rate_override}` : "—"),
    },
    {
      header: "Features",
      cell: (r) => (
        <div className="flex gap-1 text-[10px]">
          {r.is_smoking && <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded">Smoking</span>}
          {r.is_accessible && <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded">Accessible</span>}
          {r.has_balcony && <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded">Balcony</span>}
        </div>
      ),
    },
    {
      header: "Actions",
      cell: (r) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => openEdit(r)}
            className="p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            title="Edit room"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteTarget(r)}
            className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg"
            title="Delete room"
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
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Rooms</h3>
          <p className="text-xs text-slate-500">Configure rooms, floors, features, and rate overrides.</p>
        </div>
        <Button size="sm" onClick={openCreate} leftIcon={<Plus className="w-4 h-4" />}>
          Add Room
        </Button>
      </div>

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search room # or name..."
      />

      <DataTable
        columns={columns}
        data={rooms}
        isLoading={isLoading}
        isError={isError}
        emptyTitle="No rooms found"
        emptyMessage="Add your first room to start taking bookings."
        pagination={{
          page: pagination.page,
          totalPages: pagination.totalPages,
          total: pagination.total,
          limit: pagination.limit,
          onPageChange: setPage,
          onLimitChange: (l) => {
            setLimit(l);
            setPage(1);
          },
        }}
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? `Edit Room ${editing.number}` : "Add New Room"}
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
              {editing ? "Save Changes" : "Create Room"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Room Number" required error={errors.number?.message}>
              <input
                type="text"
                {...register("number")}
                placeholder="e.g. 101"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </FormField>
            <FormField label="Room Name">
              <input
                type="text"
                {...register("name")}
                placeholder="e.g. Ocean View Deluxe"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </FormField>
            <FormField label="Room Type" required error={errors.room_type_id?.message}>
              <select
                {...register("room_type_id")}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              >
                <option value="">Select Room Type</option>
                {(roomTypes || []).map((rt: RoomType) => (
                  <option key={rt.id} value={rt.id}>
                    {rt.name}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Floor">
              <select
                {...register("floor_id")}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              >
                <option value="">No Floor</option>
                {(floors || []).map((f: Floor) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <FormField label="Rate Override (per night)" error={errors.rate_override?.message}>
            <Controller
              name="rate_override"
              control={control}
              render={({ field }) => (
                <CurrencyInput value={field.value || 0} onChange={field.onChange} />
              )}
            />
          </FormField>

          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
              <input type="checkbox" {...register("is_smoking")} className="rounded" />
              Smoking Room
            </label>
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
              <input type="checkbox" {...register("is_accessible")} className="rounded" />
              Wheelchair Accessible
            </label>
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
              <input type="checkbox" {...register("has_balcony")} className="rounded" />
              Has Balcony
            </label>
          </div>

          <FormField label="Notes">
            <textarea
              rows={2}
              {...register("notes")}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
            />
          </FormField>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        title="Delete room?"
        message={`Room ${deleteTarget?.number} will be permanently removed from the property.`}
        confirmText="Delete Room"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};