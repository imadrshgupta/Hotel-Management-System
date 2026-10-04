import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reservationsApi } from "@/services/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable, Column } from "@/components/ui/DataTable";
import { FilterBar } from "@/components/ui/FilterBar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Link } from "react-router-dom";
import { useAppStore } from "@/store/app.store";
import { useRealtimeInvalidate } from "@/hooks/useRealtimeInvalidate";
import { formatCurrency } from "@/lib/utils";
import { Plus, Calendar, Check, X, Ban, Eye } from "lucide-react";
import type { Reservation } from "@/types";

export const ReservationList: React.FC = () => {
  const queryClient = useQueryClient();
  const addToast = useAppStore((s) => s.addToast);

  // Live updates: reservation lifecycle events refresh the directory instantly
  useRealtimeInvalidate({
    "reservation:created": [["reservations"]],
    "reservation:confirmed": [["reservations"]],
    "reservation:cancelled": [["reservations"]],
    "reservation:no_show": [["reservations"]],
  });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  const { data: response, isLoading, isError, refetch } = useQuery({
    queryKey: ["reservations", "list", search, statusFilter, page],
    queryFn: () =>
      reservationsApi.list({
        // Backend filters by confirmation_number (iLike), not "search"
        confirmation_number: search || undefined,
        page,
        limit: 15,
      }),
  });

  const confirmMutation = useMutation({
    mutationFn: reservationsApi.confirm,
    onSuccess: () => {
      addToast("Reservation confirmed", "success");
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
    },
    onError: (err: any) => addToast(err?.response?.data?.message || "Failed", "error"),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => reservationsApi.cancel(id, "Cancelled by user"),
    onSuccess: () => {
      addToast("Reservation cancelled", "info");
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
    },
    onError: (err: any) => addToast(err?.response?.data?.message || "Failed", "error"),
  });

  const reservations = response?.data || [];
  const pagination = response?.pagination || { page: 1, totalPages: 1, total: 0, limit: 15 };

  const columns: Column<Reservation>[] = [
    {
      header: "Conf #",
      cell: (r) => (
        <span className="font-bold text-blue-600 dark:text-blue-400">
          {r.confirmation_number}
        </span>
      ),
    },
    {
      header: "Guest",
      cell: (r) => {
        const g = r.guests?.[0]?.guest;
        return g ? `${g.first_name} ${g.last_name}` : "Guest";
      },
    },
    {
      header: "Room Type",
      cell: (r) => r.roomType?.name || "Standard Room",
    },
    {
      header: "Check-in",
      accessorKey: "check_in_date",
    },
    {
      header: "Check-out",
      accessorKey: "check_out_date",
    },
    {
      header: "Total / Advance",
      cell: (r) => (
        <div>
          <span className="font-bold text-slate-900 dark:text-white">
            {formatCurrency(r.total_amount || 0)}
          </span>
          {r.advance_paid > 0 && (
            <span className="text-[11px] text-emerald-600 block">
              Paid: {formatCurrency(r.advance_paid)}
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Status",
      cell: (r) => <StatusBadge status={r.status} type="reservation" size="sm" />,
    },
    {
      header: "Actions",
      cell: (r) => (
        <div className="flex items-center gap-1.5">
          {r.status === "INQUIRY" && (
            <button
              onClick={() => confirmMutation.mutate(r.id)}
              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"
              title="Confirm Reservation"
            >
              <Check className="w-4 h-4" />
            </button>
          )}
          {r.status !== "CANCELLED" && r.status !== "CHECKED_OUT" && (
            <button
              onClick={() => cancelMutation.mutate(r.id)}
              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
              title="Cancel Reservation"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <Link
            to={`/reservations/${r.id}`}
            className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reservations Directory"
        subtitle="Manage upcoming, confirmed, and historical booking reservations."
        breadcrumbs={[{ label: "Reservations" }, { label: "All Reservations" }]}
        actions={
          <div className="flex items-center gap-2">
            <Link to="/reservations/availability">
              <Button size="sm" variant="outline" leftIcon={<Calendar className="w-4 h-4" />}>
                Availability Matrix
              </Button>
            </Link>
            <Link to="/reservations/new">
              <Button size="sm" leftIcon={<Plus className="w-4 h-4" />}>
                New Reservation
              </Button>
            </Link>
          </div>
        }
      />

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search confirmation # or guest..."
      >
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="py-2 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
        >
          <option value="">All Statuses</option>
          <option value="INQUIRY">Inquiry</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="CHECKED_IN">Checked In</option>
          <option value="CHECKED_OUT">Checked Out</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </FilterBar>

      <DataTable
        columns={columns}
        data={reservations}
        isLoading={isLoading}
        isError={isError}
        pagination={{
          page: pagination.page,
          totalPages: pagination.totalPages,
          total: pagination.total,
          limit: pagination.limit,
          onPageChange: setPage,
        }}
      />
    </div>
  );
};
