import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { guestsApi } from "@/services/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable, Column } from "@/components/ui/DataTable";
import { FilterBar } from "@/components/ui/FilterBar";
import { Button } from "@/components/ui/Button";
import { Link } from "react-router-dom";
import { Plus, Crown, Phone, Mail, Eye } from "lucide-react";
import type { Guest } from "@/types";

export const GuestList: React.FC = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data: response, isLoading, isError } = useQuery({
    queryKey: ["guests", "list", search, page],
    queryFn: () => guestsApi.list({ search, page, limit: 15 }),
  });

  const guests = response?.data || [];
  const pagination = response?.pagination || { page: 1, totalPages: 1, total: 0, limit: 15 };

  const columns: Column<Guest>[] = [
    {
      header: "Guest Name",
      cell: (g) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
            {g.first_name?.[0]}
            {g.last_name?.[0]}
          </div>
          <div>
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              {g.first_name} {g.last_name}
              {g.vip_status === "VIP" && (
                <span className="p-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300" title="VIP Guest">
                  <Crown className="w-3 h-3" />
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-500">{g.nationality || "Standard Guest"}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Contact Info",
      cell: (g) => (
        <div className="text-xs space-y-0.5">
          {g.email && <div className="text-slate-600 dark:text-slate-300 flex items-center gap-1"><Mail className="w-3 h-3 text-slate-400"/>{g.email}</div>}
          {g.phone && <div className="text-slate-500 flex items-center gap-1"><Phone className="w-3 h-3 text-slate-400"/>{g.phone}</div>}
        </div>
      ),
    },
    {
      header: "ID Document",
      cell: (g) => (g.id_type ? `${g.id_type}: ${g.id_number || "-"}` : "None"),
    },
    {
      header: "Total Stays",
      accessorKey: "total_stays",
      cell: (g) => <span className="font-bold text-slate-900 dark:text-white">{g.total_stays || 0}</span>,
    },
    {
      header: "Actions",
      cell: (g) => (
        <Link to={`/guests/${g.id}`}>
          <Button size="sm" variant="ghost" leftIcon={<Eye className="w-3.5 h-3.5" />}>
            View Profile
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Guest CRM Directory"
        subtitle="Manage guest profiles, VIP statuses, and stay history."
        breadcrumbs={[{ label: "Guests" }, { label: "All Guests" }]}
        actions={
          <Link to="/guests/new">
            <Button size="sm" leftIcon={<Plus className="w-4 h-4" />}>
              Add Guest Profile
            </Button>
          </Link>
        }
      />

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search guest name, email or phone..."
      />

      <DataTable
        columns={columns}
        data={guests}
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
