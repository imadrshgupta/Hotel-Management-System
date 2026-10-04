import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { staysApi, reportsApi } from "@/services/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable, Column } from "@/components/ui/DataTable";
import { FilterBar } from "@/components/ui/FilterBar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { FormField } from "@/components/ui/FormField";
import { CheckOutModal } from "./CheckOutModal";
import { useAppStore } from "@/store/app.store";
import { useRealtimeInvalidate } from "@/hooks/useRealtimeInvalidate";
import { Link } from "react-router-dom";
import { Users, LogOut, Calendar, Receipt } from "lucide-react";
import type { Stay } from "@/types";

export const InHouse: React.FC = () => {
  const queryClient = useQueryClient();
  const addToast = useAppStore((s) => s.addToast);

  // Live updates: check-ins/outs broadcast by the backend refresh this board
  useRealtimeInvalidate({
    "stay:checked_in": [["stays"]],
    "stay:checked_out": [["stays"]],
    "payment:created": [["stays"]],
  });
  const [search, setSearch] = useState("");
  const [selectedCheckoutStay, setSelectedCheckoutStay] = useState<Stay | null>(null);
  const [extendStayItem, setExtendStayItem] = useState<Stay | null>(null);
  const [newCheckOutDate, setNewCheckOutDate] = useState("");

  const { data: staysData, isLoading, isError } = useQuery({
    queryKey: ["stays", "active"],
    queryFn: () => staysApi.getActive(),
  });

  const extendStayMutation = useMutation({
    mutationFn: (data: { id: string; date: string }) =>
      staysApi.extendStay(data.id, data.date),
    onSuccess: () => {
      addToast("Stay extended successfully!", "success");
      queryClient.invalidateQueries({ queryKey: ["stays"] });
      setExtendStayItem(null);
    },
    onError: (err: any) => {
      addToast(err?.response?.data?.message || "Failed to extend stay", "error");
    },
  });

  const staysList: Stay[] = staysData || [];
  const filtered = staysList.filter((s) => {
    if (!search) return true;
    const name = `${s.guest?.first_name || ""} ${s.guest?.last_name || ""}`.toLowerCase();
    const room = (s.room?.number || "").toLowerCase();
    return name.includes(search.toLowerCase()) || room.includes(search.toLowerCase());
  });

  const columns: Column<Stay>[] = [
    {
      header: "Room #",
      cell: (s) => (
        <span className="font-bold text-slate-900 dark:text-white">
          Room {s.room?.number || "-"}
        </span>
      ),
    },
    {
      header: "Guest Name",
      cell: (s) => (s.guest ? `${s.guest.first_name} ${s.guest.last_name}` : "In-house Guest"),
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
      header: "Adults / Children",
      cell: (s) => `${s.adults || 1} A / ${s.children || 0} C`,
    },
    {
      header: "Actions",
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
            onClick={() => {
              setExtendStayItem(s);
              setNewCheckOutDate(s.check_out_date);
            }}
            leftIcon={<Calendar className="w-3.5 h-3.5" />}
          >
            Extend Stay
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setSelectedCheckoutStay(s)}
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
        title="In-House Guests"
        subtitle="Active guest stays currently checked in at the hotel."
        breadcrumbs={[{ label: "Front Office" }, { label: "In-house" }]}
      />

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by room # or guest name..."
      />

      <DataTable
        columns={columns}
        data={filtered}
        isLoading={isLoading}
        isError={isError}
        emptyTitle="No in-house guests"
        emptyMessage="There are currently no active checked-in guests."
      />

      {/* Extend Stay Modal */}
      {extendStayItem && (
        <Modal
          isOpen={!!extendStayItem}
          onClose={() => setExtendStayItem(null)}
          title={`Extend Stay — Room ${extendStayItem.room?.number}`}
          size="sm"
          footer={
            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setExtendStayItem(null)}>
                Cancel
              </Button>
              <Button
                size="sm"
                isLoading={extendStayMutation.isPending}
                onClick={() =>
                  extendStayMutation.mutate({
                    id: extendStayItem.id,
                    date: newCheckOutDate,
                  })
                }
              >
                Save Extension
              </Button>
            </div>
          }
        >
          <FormField label="New Check-Out Date" required>
            <input
              type="date"
              value={newCheckOutDate}
              onChange={(e) => setNewCheckOutDate(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
            />
          </FormField>
        </Modal>
      )}

      {selectedCheckoutStay && (
        <CheckOutModal
          isOpen={!!selectedCheckoutStay}
          onClose={() => setSelectedCheckoutStay(null)}
          stay={selectedCheckoutStay}
        />
      )}
    </div>
  );
};
