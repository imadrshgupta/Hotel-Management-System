import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { reportsApi } from "@/services/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable, Column } from "@/components/ui/DataTable";
import { FilterBar } from "@/components/ui/FilterBar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { CheckOutModal } from "./CheckOutModal";
import { useRealtimeInvalidate } from "@/hooks/useRealtimeInvalidate";
import { Link } from "react-router-dom";
import { LogOut, Receipt } from "lucide-react";
import type { Stay } from "@/types";

export const Departures: React.FC = () => {
  const [search, setSearch] = useState("");

  // Live updates: check-outs broadcast by the backend refresh this list
  useRealtimeInvalidate({
    "stay:checked_out": [["reports", "departures"]],
    "payment:created": [["reports", "departures"]],
  });
  const [selectedStay, setSelectedStay] = useState<Stay | null>(null);

  const { data: departuresData, isLoading, isError } = useQuery({
    queryKey: ["reports", "departures", search],
    queryFn: () => reportsApi.getDepartures(),
  });

  const list: Stay[] = departuresData?.guests || departuresData || [];
  const filtered = list.filter((s) => {
    if (!search) return true;
    const name = `${s.guest?.first_name || ""} ${s.guest?.last_name || ""}`.toLowerCase();
    const room = (s.room?.number || "").toLowerCase();
    return name.includes(search.toLowerCase()) || room.includes(search.toLowerCase());
  });

  const columns: Column<Stay>[] = [
    {
      header: "Room #",
      cell: (s) => <span className="font-bold text-slate-900 dark:text-white">Room {s.room?.number || "-"}</span>,
    },
    {
      header: "Guest Name",
      cell: (s) => (s.guest ? `${s.guest.first_name} ${s.guest.last_name}` : "Guest"),
    },
    {
      header: "Check-in",
      accessorKey: "check_in_date",
    },
    {
      header: "Check-out Expected",
      accessorKey: "check_out_date",
    },
    {
      header: "Stay Status",
      cell: (s) => <StatusBadge status={s.status} type="generic" size="sm" />,
    },
    {
      header: "Action",
      cell: (s) => (
        <div className="flex items-center gap-2">
          <Link to={`/billing/folio/${s.id}`}>
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Receipt className="w-3.5 h-3.5" />}
            >
              Folio
            </Button>
          </Link>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setSelectedStay(s)}
            leftIcon={<LogOut className="w-3.5 h-3.5" />}
          >
            Check Out
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Today's Departures"
        subtitle="Manage guest check-outs, folio settlement, and room departures."
        breadcrumbs={[{ label: "Front Office" }, { label: "Departures" }]}
      />

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search room # or guest name..."
      />

      <DataTable
        columns={columns}
        data={filtered}
        isLoading={isLoading}
        isError={isError}
        emptyTitle="No expected departures"
        emptyMessage="There are no expected departures scheduled for today."
      />

      {selectedStay && (
        <CheckOutModal
          isOpen={!!selectedStay}
          onClose={() => setSelectedStay(null)}
          stay={selectedStay}
        />
      )}
    </div>
  );
};
