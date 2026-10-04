import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { floorsApi } from "@/services/api";
import { DataTable, Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { FormField } from "@/components/ui/FormField";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useAppStore } from "@/store/app.store";
import { floorFormSchema, type FloorFormData } from "@/lib/validation";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { Floor } from "@/types";

const EMPTY_FORM: FloorFormData = {
  name: "",
  code: "",
  level: 1,
  description: "",
  is_active: true,
};

export const SettingsFloors: React.FC = () => {
  const queryClient = useQueryClient();
  const addToast = useAppStore((s) => s.addToast);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Floor | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Floor | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FloorFormData>({
    resolver: zodResolver(floorFormSchema),
    defaultValues: EMPTY_FORM,
  });

  const { data: floors, isLoading, isError } = useQuery({
    queryKey: ["floors", "settings"],
    queryFn: () => floorsApi.list(),
  });

  const createMutation = useMutation({
    mutationFn: floorsApi.create,
    onSuccess: () => {
      addToast("Floor created successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["floors"] });
      setModalOpen(false);
      reset(EMPTY_FORM);
    },
    onError: (err: any) =>
      addToast(err?.response?.data?.message || "Failed to create floor", "error"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => floorsApi.update(id, data),
    onSuccess: () => {
      addToast("Floor updated successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["floors"] });
      setModalOpen(false);
      reset(EMPTY_FORM);
    },
    onError: (err: any) =>
      addToast(err?.response?.data?.message || "Failed to update floor", "error"),
  });

  const deleteMutation = useMutation({
    mutationFn: floorsApi.delete,
    onSuccess: () => {
      addToast("Floor deleted", "info");
      queryClient.invalidateQueries({ queryKey: ["floors"] });
      setDeleteTarget(null);
    },
    onError: (err: any) =>
      addToast(err?.response?.data?.message || "Failed to delete floor", "error"),
  });

  const openCreate = () => {
    setEditing(null);
    reset(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (floor: Floor) => {
    setEditing(floor);
    reset({
      name: floor.name,
      code: floor.code,
      level: floor.level,
      description: floor.description || "",
      is_active: floor.is_active,
    });
    setModalOpen(true);
  };

  const onSubmit = (form: FloorFormData) => {
    const payload: any = {
      name: form.name.trim(),
      code: form.code.trim().toUpperCase(),
      level: form.level,
      description: form.description?.trim() || undefined,
      is_active: !!form.is_active,
    };
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const list: Floor[] = floors || [];

  const columns: Column<Floor>[] = [
    {
      header: "Name",
      cell: (f) => <span className="font-bold text-slate-900 dark:text-white">{f.name}</span>,
    },
    {
      header: "Code",
      cell: (f) => <span className="font-mono text-xs">{f.code}</span>,
    },
    {
      header: "Level",
      cell: (f) => f.level,
    },
    {
      header: "Description",
      cell: (f) => f.description || "—",
    },
    {
      header: "Status",
      cell: (f) => (
        <StatusBadge status={f.is_active ? "ACTIVE" : "INACTIVE"} type="generic" size="sm" />
      ),
    },
    {
      header: "Actions",
      cell: (f) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => openEdit(f)}
            className="p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            title="Edit floor"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteTarget(f)}
            className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg"
            title="Delete floor"
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
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Floors</h3>
          <p className="text-xs text-slate-500">Building floors used to organize rooms.</p>
        </div>
        <Button size="sm" onClick={openCreate} leftIcon={<Plus className="w-4 h-4" />}>
          Add Floor
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={list}
        isLoading={isLoading}
        isError={isError}
        emptyTitle="No floors found"
        emptyMessage="Add floors to organize your rooms."
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? `Edit Floor — ${editing.name}` : "Add New Floor"}
        size="sm"
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
              {editing ? "Save Changes" : "Create Floor"}
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
                placeholder="e.g. Ground Floor"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </FormField>
            <FormField label="Code" required error={errors.code?.message}>
              <input
                type="text"
                {...register("code")}
                placeholder="e.g. G"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </FormField>
            <FormField label="Level" required error={errors.level?.message}>
              <input
                type="number"
                {...register("level")}
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
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
            <input type="checkbox" {...register("is_active")} className="rounded" />
            Active
          </label>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        title="Delete floor?"
        message={`${deleteTarget?.name} will be removed. Rooms assigned to this floor will become floorless.`}
        confirmText="Delete Floor"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};