import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { reportsApi, reservationsApi } from "@/services/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable, Column } from "@/components/ui/DataTable";
import { FilterBar } from "@/components/ui/FilterBar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { CheckInModal } from "./CheckInModal";
import { useRealtimeInvalidate } from "@/hooks/useRealtimeInvalidate";
import { ArrowDownToLine, CheckCircle2 } from "lucide-react";
import type { Reservation } from "@/types";

export const Arrivals: React.FC = () => {
  const [search, setSearch] = useState("");

  // Live updates: new confirmations & check-ins refresh the list instantly
  useRealtimeInvalidate({
    "reservation:created": [["reports", "arrivals"], ["reservations"]],
    "reservation:confirmed": [["reports", "arrivals"], ["reservations"]],
    "reservation:cancelled": [["reports", "arrivals"], ["reservations"]],
    "reservation:no_show": [["reports", "arrivals"], ["reservations"]],
    "stay:checked_in": [["reports", "arrivals"], ["reservations"]],
  });
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

  const { data: arrivalsData, isLoading, isError, refetch } = useQuery({
    queryKey: ["reports", "arrivals", search],
    queryFn: () => reportsApi.getArrivals(),
  });

  const list: Reservation[] = arrivalsData?.guests || arrivalsData || [];
  const filtered = list.filter((r) => {
    if (!search) return true;
    const name = `${r.guests?.[0]?.guest?.first_name || ""} ${r.guests?.[0]?.guest?.last_name || ""}`.toLowerCase();
    const conf = (r.confirmation_number || "").toLowerCase();
    return name.includes(search.toLowerCase()) || conf.includes(search.toLowerCase());
  });

  const columns: Column<Reservation>[] = [
    {
      header: "Confirmation #",
      accessorKey: "confirmation_number",
      cell: (r) => <span className="font-bold text-blue-600 dark:text-blue-400">{r.confirmation_number}</span>,
    },
    {
      header: "Guest Name",
      cell: (r) => {
        const g = r.guests?.[0]?.guest;
        return g ? `${g.first_name} ${g.last_name}` : "Primary Guest";
      },
    },
    {
      header: "Room Type",
      cell: (r) => r.roomType?.name || "Standard Room",
    },
    {
      header: "Check-in Date",
      accessorKey: "check_in_date",
    },
    {
      header: "Check-out Date",
      accessorKey: "check_out_date",
    },
    {
      header: "Status",
      cell: (r) => <StatusBadge status={r.status} type="reservation" size="sm" />,
    },
    {
      header: "Action",
      cell: (r) => (
        <Button
          size="sm"
          onClick={() => setSelectedReservation(r)}
          leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
        >
          Check In
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Today's Arrivals"
        subtitle="Manage and process check-ins for guests arriving today."
        breadcrumbs={[{ label: "Front Office" }, { label: "Arrivals" }]}
      />

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search confirmation # or guest name..."
      />

      <DataTable
        columns={columns}
        data={filtered}
        isLoading={isLoading}
        isError={isError}
        emptyTitle="No expected arrivals"
        emptyMessage="There are no expected guest check-ins for today matching your query."
      />

      {selectedReservation && (
        <CheckInModal
          isOpen={!!selectedReservation}
          onClose={() => setSelectedReservation(null)}
          reservation={selectedReservation}
        />
      )}
    </div>
  );
};
