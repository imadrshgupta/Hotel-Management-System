import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "@/services/api";
import { DataTable, Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { FormField } from "@/components/ui/FormField";
import { FilterBar } from "@/components/ui/FilterBar";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useAppStore } from "@/store/app.store";
import { userFormSchema, type UserFormData } from "@/lib/validation";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { User } from "@/types";

const EMPTY_FORM: UserFormData = {
  email: "",
  password: "",
  first_name: "",
  last_name: "",
  phone: "",
};

export const SettingsUsers: React.FC = () => {
  const queryClient = useQueryClient();
  const addToast = useAppStore((s) => s.addToast);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: EMPTY_FORM,
  });

  const { data: response, isLoading, isError } = useQuery({
    queryKey: ["users", "list", search, page, limit],
    queryFn: () => usersApi.list({ search, page, limit }),
  });

  const createMutation = useMutation({
    mutationFn: usersApi.create,
    onSuccess: () => {
      addToast("User created successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setModalOpen(false);
      reset(EMPTY_FORM);
    },
    onError: (err: any) =>
      addToast(err?.response?.data?.message || "Failed to create user", "error"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => usersApi.update(id, data),
    onSuccess: () => {
      addToast("User updated successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setModalOpen(false);
      reset(EMPTY_FORM);
    },
    onError: (err: any) =>
      addToast(err?.response?.data?.message || "Failed to update user", "error"),
  });

  const deleteMutation = useMutation({
    mutationFn: usersApi.delete,
    onSuccess: () => {
      addToast("User deleted", "info");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setDeleteTarget(null);
    },
    onError: (err: any) =>
      addToast(err?.response?.data?.message || "Failed to delete user", "error"),
  });

  const openCreate = () => {
    setEditing(null);
    reset(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (user: User) => {
    setEditing(user);
    reset({
      email: user.email,
      password: "",
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone || "",
    });
    setModalOpen(true);
  };

  const onSubmit = (form: UserFormData) => {
    if (editing) {
      updateMutation.mutate({
        id: editing.id,
        data: {
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          email: form.email.trim(),
          phone: form.phone?.trim() || undefined,
        },
      });
    } else {
      createMutation.mutate({
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim(),
        phone: form.phone?.trim() || undefined,
        password: form.password!,
      });
    }
  };

  const users: User[] = response?.data || [];
  const pagination = response?.pagination || { page: 1, totalPages: 1, total: 0, limit };

  const columns: Column<User>[] = [
    {
      header: "Name",
      cell: (u) => (
        <div>
          <span className="font-bold text-slate-900 dark:text-white">
            {u.first_name} {u.last_name}
          </span>
          <span className="block text-[11px] text-slate-500">{u.email}</span>
        </div>
      ),
    },
    {
      header: "Phone",
      cell: (u) => u.phone || "—",
    },
    {
      header: "Roles",
      cell: (u) =>
        u.roles?.length
          ? u.roles.map((r) => r.name).join(", ")
          : "—",
    },
    {
      header: "Status",
      cell: (u) => (
        <StatusBadge status={u.is_active ? "ACTIVE" : "INACTIVE"} type="generic" size="sm" />
      ),
    },
    {
      header: "Last Login",
      cell: (u) => (u.last_login_at ? formatDate(u.last_login_at) : "Never"),
    },
    {
      header: "Actions",
      cell: (u) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => openEdit(u)}
            className="p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            title="Edit user"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteTarget(u)}
            className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg"
            title="Delete user"
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
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Users & Staff</h3>
          <p className="text-xs text-slate-500">Create and manage staff accounts.</p>
        </div>
        <Button size="sm" onClick={openCreate} leftIcon={<Plus className="w-4 h-4" />}>
          Add User
        </Button>
      </div>

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search name or email..."
      />

      <DataTable
        columns={columns}
        data={users}
        isLoading={isLoading}
        isError={isError}
        emptyTitle="No users found"
        emptyMessage="Add your first staff account to get started."
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
        title={editing ? `Edit User — ${editing.first_name} ${editing.last_name}` : "Add New User"}
        description={editing ? "Update staff account details." : "Create a staff account for the hotel."}
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
              {editing ? "Save Changes" : "Create User"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="First Name" required error={errors.first_name?.message}>
              <input
                type="text"
                {...register("first_name")}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </FormField>
            <FormField label="Last Name" required error={errors.last_name?.message}>
              <input
                type="text"
                {...register("last_name")}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </FormField>
          </div>
          <FormField label="Email" required error={errors.email?.message}>
            <input
              type="email"
              {...register("email")}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
            />
          </FormField>
          <FormField label="Phone">
            <input
              type="tel"
              {...register("phone")}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
            />
          </FormField>
          {!editing && (
            <FormField label="Password" required error={errors.password?.message} helpText="Minimum 8 characters">
              <input
                type="password"
                {...register("password")}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </FormField>
          )}
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        title="Delete user?"
        message={`${deleteTarget?.first_name} ${deleteTarget?.last_name} will lose access to the system permanently.`}
        confirmText="Delete User"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};