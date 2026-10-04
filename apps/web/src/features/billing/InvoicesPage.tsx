import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { invoicesApi } from "@/services/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable, Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { FilterBar } from "@/components/ui/FilterBar";
import { useAppStore } from "@/store/app.store";
import { useRealtimeInvalidate } from "@/hooks/useRealtimeInvalidate";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { FileText, Eye, FileCheck2, Ban } from "lucide-react";
import type { Invoice } from "@/types";

export const InvoicesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const addToast = useAppStore((s) => s.addToast);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [voidTarget, setVoidTarget] = useState<Invoice | null>(null);

  useRealtimeInvalidate({
    "payment:created": [["invoices"]],
  });

  const { data: response, isLoading, isError } = useQuery({
    queryKey: ["invoices", "list", search, statusFilter, page, limit],
    queryFn: () =>
      invoicesApi.list({
        // Backend filters by invoice_number (iLike), not "search"
        invoice_number: search || undefined,
        page,
        limit,
        status: statusFilter,
      }),
  });

  const { data: detail, isLoading: isLoadingDetail } = useQuery({
    queryKey: ["invoices", selectedInvoice?.id],
    queryFn: () => invoicesApi.get(selectedInvoice!.id),
    enabled: !!selectedInvoice?.id,
  });

  const finalizeMutation = useMutation({
    mutationFn: invoicesApi.finalize,
    onSuccess: () => {
      addToast("Invoice finalized", "success");
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      setSelectedInvoice(null);
    },
    onError: (err: any) =>
      addToast(err?.response?.data?.message || "Finalize failed", "error"),
  });

  const voidMutation = useMutation({
    mutationFn: invoicesApi.void,
    onSuccess: () => {
      addToast("Invoice voided", "info");
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      setVoidTarget(null);
      setSelectedInvoice(null);
    },
    onError: (err: any) =>
      addToast(err?.response?.data?.message || "Void failed", "error"),
  });

  const invoices: Invoice[] = response?.data || [];
  const pagination = response?.pagination || {
    page: 1,
    totalPages: 1,
    total: 0,
    limit,
  };

  const columns: Column<Invoice>[] = [
    {
      header: "Invoice #",
      cell: (inv) => (
        <span className="font-bold text-blue-600 dark:text-blue-400">
          {inv.invoice_number}
        </span>
      ),
    },
    {
      header: "Guest",
      cell: (inv) =>
        inv.guest
          ? `${inv.guest.first_name} ${inv.guest.last_name}`
          : "—",
    },
    {
      header: "Room",
      cell: (inv) => (inv.stay?.room?.number ? `Room ${inv.stay.room.number}` : "—"),
    },
    {
      header: "Status",
      cell: (inv) => <StatusBadge status={inv.status} type="invoice" size="sm" />,
    },
    {
      header: "Total",
      cell: (inv) => (
        <span className="font-bold text-slate-900 dark:text-white">
          {formatCurrency(inv.total_amount)}
        </span>
      ),
    },
    {
      header: "Paid",
      cell: (inv) => (
        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
          {formatCurrency(inv.paid_amount)}
        </span>
      ),
    },
    {
      header: "Balance",
      cell: (inv) => (
        <span
          className={`font-semibold ${
            inv.balance > 0
              ? "text-rose-600 dark:text-rose-400"
              : "text-slate-500"
          }`}
        >
          {formatCurrency(inv.balance)}
        </span>
      ),
    },
    {
      header: "Issued",
      cell: (inv) => (
        <span className="text-xs whitespace-nowrap">
          {formatDateTime(inv.issued_at)}
        </span>
      ),
    },
    {
      header: "",
      cell: (inv) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => setSelectedInvoice(inv)}
          leftIcon={<Eye className="w-3.5 h-3.5" />}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices"
        subtitle="Generate, finalize, and manage stay invoices."
        breadcrumbs={[{ label: "Billing" }, { label: "Invoices" }]}
      />

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search invoice # or guest..."
      >
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="py-2 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
        >
          <option value="">All Statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="FINALIZED">Finalized</option>
          <option value="PAID">Paid</option>
          <option value="VOID">Void</option>
        </select>
      </FilterBar>

      <DataTable
        columns={columns}
        data={invoices}
        isLoading={isLoading}
        isError={isError}
        emptyTitle="No invoices found"
        emptyMessage="Invoices are generated at check-out or on demand."
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

      {/* Detail Modal */}
      <Modal
        isOpen={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        title={
          selectedInvoice
            ? `Invoice ${selectedInvoice.invoice_number}`
            : "Invoice"
        }
        description={
          selectedInvoice?.guest
            ? `Guest: ${selectedInvoice.guest.first_name} ${selectedInvoice.guest.last_name}`
            : undefined
        }
        size="md"
        footer={
          detail && (
            <div className="flex items-center justify-between w-full">
              <span>
                <StatusBadge status={detail.status} type="invoice" size="sm" />
              </span>
              <div className="flex items-center gap-2">
                {detail.status === "DRAFT" && (
                  <Button
                    size="sm"
                    variant="success"
                    isLoading={finalizeMutation.isPending}
                    onClick={() => finalizeMutation.mutate(detail.id)}
                    leftIcon={<FileCheck2 className="w-4 h-4" />}
                  >
                    Finalize
                  </Button>
                )}
                {detail.status !== "VOID" && (
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => setVoidTarget(detail)}
                    leftIcon={<Ban className="w-4 h-4" />}
                  >
                    Void
                  </Button>
                )}
              </div>
            </div>
          )
        }
      >
        {isLoadingDetail ? (
          <LoadingState message="Loading invoice details..." />
        ) : detail ? (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <div>
                <p className="text-[11px] text-slate-500">Subtotal</p>
                <p className="text-sm font-bold">{formatCurrency(detail.subtotal)}</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-500">Tax</p>
                <p className="text-sm font-bold">{formatCurrency(detail.tax_amount)}</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-500">Discount</p>
                <p className="text-sm font-bold">
                  {detail.discount_amount
                    ? `-${formatCurrency(detail.discount_amount)}`
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-slate-500">Total</p>
                <p className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {formatCurrency(detail.total_amount)}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-slate-500">Paid</p>
                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(detail.paid_amount)}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-slate-500">Balance</p>
                <p
                  className={`text-sm font-bold ${
                    detail.balance > 0
                      ? "text-rose-600 dark:text-rose-400"
                      : "text-slate-500"
                  }`}
                >
                  {formatCurrency(detail.balance)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div className="text-xs space-y-0.5">
                <p className="font-semibold text-slate-900 dark:text-white">
                  Stay: {detail.stay_id}
                </p>
                {detail.notes && (
                  <p className="text-slate-500">Notes: {detail.notes}</p>
                )}
                {detail.paid_at && (
                  <p className="text-slate-500">
                    Paid at: {formatDateTime(detail.paid_at)}
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <ErrorState title="Failed to load invoice" />
        )}
      </Modal>

      {/* Void confirm */}
      <ConfirmDialog
        isOpen={!!voidTarget}
        onClose={() => setVoidTarget(null)}
        onConfirm={() => voidTarget && voidMutation.mutate(voidTarget.id)}
        title="Void this invoice?"
        message={`Invoice ${voidTarget?.invoice_number} (${formatCurrency(voidTarget?.total_amount || 0)}) will be marked as void and can no longer be used for settlement.`}
        confirmText="Void Invoice"
        isLoading={voidMutation.isPending}
      />
    </div>
  );
};