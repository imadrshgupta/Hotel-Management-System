import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { staysApi, foliosApi, paymentsApi } from "@/services/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable, Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { FormField } from "@/components/ui/FormField";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { SearchInput } from "@/components/ui/SearchInput";
import { useAppStore } from "@/store/app.store";
import { useRealtimeInvalidate } from "@/hooks/useRealtimeInvalidate";
import { PAYMENT_METHODS, PAYMENT_METHOD_LABELS } from "@/constants";
import { paymentSchema, type PaymentFormData } from "@/lib/validation";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CreditCard, Receipt, Undo2, ChevronRight } from "lucide-react";
import type { Stay, Payment } from "@/types";

export const PaymentsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const addToast = useAppStore((s) => s.addToast);

  const [search, setSearch] = useState("");
  const [selectedStay, setSelectedStay] = useState<Stay | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [refundPayment, setRefundPayment] = useState<Payment | null>(null);

  const {
    register: registerPayment,
    control: controlPayment,
    reset: resetPayment,
    handleSubmit: handlePaymentSubmit,
    formState: { errors: paymentErrors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: { amount: 0, method: "CASH", reference_number: "" },
  });

  // Live updates
  useRealtimeInvalidate({
    "payment:created": [["stays"], ["folios"], ["payments"]],
    "stay:checked_in": [["stays"]],
    "stay:checked_out": [["stays"]],
  });

  // ── Data ────────────────────────────────────────────────────
  const { data: activeStays, isLoading, isError, refetch } = useQuery({
    queryKey: ["stays", "active"],
    queryFn: () => staysApi.getActive(),
  });

  const staysList: Stay[] = activeStays || [];
  const filteredStays = staysList.filter((s) => {
    if (!search) return true;
    const name = `${s.guest?.first_name || ""} ${s.guest?.last_name || ""}`.toLowerCase();
    const room = (s.room?.number || "").toLowerCase();
    return name.includes(search.toLowerCase()) || room.includes(search.toLowerCase());
  });

  const { data: folio, isLoading: isLoadingFolio } = useQuery({
    queryKey: ["folios", "stay", selectedStay?.id],
    queryFn: () => foliosApi.getByStay(selectedStay!.id),
    enabled: !!selectedStay?.id,
  });

  const { data: payments } = useQuery({
    queryKey: ["payments", "folio", folio?.id],
    queryFn: () => paymentsApi.getByFolio(folio!.id),
    enabled: !!folio?.id,
  });

  // ── Mutations ───────────────────────────────────────────────
  const recordPaymentMutation = useMutation({
    mutationFn: paymentsApi.create,
    onSuccess: () => {
      addToast("Payment recorded successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["folios"] });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["stays"] });
      setShowPayment(false);
    },
    onError: (err: any) =>
      addToast(err?.response?.data?.message || "Payment failed", "error"),
  });

  const refundMutation = useMutation({
    mutationFn: ({ id, amount, reason }: { id: string; amount: number; reason: string }) =>
      paymentsApi.refund(id, { amount, reason }),
    onSuccess: () => {
      addToast("Refund processed", "success");
      queryClient.invalidateQueries({ queryKey: ["folios"] });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      setRefundPayment(null);
    },
    onError: (err: any) =>
      addToast(err?.response?.data?.message || "Refund failed", "error"),
  });

  const balance = Number(folio?.balance || 0);

  const paymentColumns: Column<Payment>[] = [
    {
      header: "Date",
      cell: (p) => (
        <span className="text-xs whitespace-nowrap">
          {formatDate(p.processed_at)}
        </span>
      ),
    },
    {
      header: "Method",
      cell: (p) => PAYMENT_METHOD_LABELS[p.method] || p.method,
    },
    { header: "Reference", cell: (p) => p.reference_number || "—" },
    {
      header: "Amount",
      cell: (p) => (
        <span className="font-bold text-emerald-600 dark:text-emerald-400">
          {formatCurrency(p.amount)}
        </span>
      ),
    },
    {
      header: "Status",
      cell: (p) => <StatusBadge status={p.status} type="generic" size="sm" />,
    },
    {
      header: "",
      cell: (p) =>
        p.status === "COMPLETED" || p.status === "PARTIALLY_REFUNDED" ? (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setRefundPayment(p)}
            leftIcon={<Undo2 className="w-3.5 h-3.5" />}
          >
            Refund
          </Button>
        ) : null,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments Workbench"
        subtitle="Select an in-house stay to view its folio balance, record payments, or process refunds."
        breadcrumbs={[{ label: "Billing" }, { label: "Payments" }]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stay selector */}
        <div className="space-y-3">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search guest or room..."
          />

          {isLoading ? (
            <LoadingState message="Loading in-house stays..." />
          ) : isError ? (
            <ErrorState title="Failed to load stays" onRetry={refetch} />
          ) : filteredStays.length === 0 ? (
            <EmptyState
              title="No in-house stays"
              message="Check-ins appear here automatically."
            />
          ) : (
            <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
              {filteredStays.map((stay) => {
                const active =
                  selectedStay?.id === stay.id;
                return (
                  <button
                    key={stay.id}
                    onClick={() => setSelectedStay(stay)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all ${
                      active
                        ? "bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800 shadow-sm"
                        : "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-blue-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        Room {stay.room?.number || "—"}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {stay.guest
                        ? `${stay.guest.first_name} ${stay.guest.last_name}`
                        : "Guest"}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Check-out: {formatDate(stay.check_out_date)}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected stay detail */}
        <div className="lg:col-span-2 space-y-6">
          {!selectedStay ? (
            <div className="p-10 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center">
              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-400 mb-3">
                <CreditCard className="w-8 h-8" />
              </div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Select a stay to manage payments
              </p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Folio balance, payment history, and refund actions will appear here.
              </p>
            </div>
          ) : isLoadingFolio ? (
            <LoadingState message="Loading folio..." />
          ) : (
            <>
              {/* Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                  <p className="text-[11px] text-slate-500">Charges</p>
                  <p className="text-base font-bold mt-1">
                    {formatCurrency(folio?.total_charges || 0)}
                  </p>
                </div>
                <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                  <p className="text-[11px] text-slate-500">Taxes</p>
                  <p className="text-base font-bold mt-1">
                    {formatCurrency(folio?.total_taxes || 0)}
                  </p>
                </div>
                <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                  <p className="text-[11px] text-slate-500">Paid</p>
                  <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                    {formatCurrency(folio?.total_payments || 0)}
                  </p>
                </div>
                <div
                  className={`p-4 rounded-2xl border ${
                    balance > 0
                      ? "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/50"
                      : "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50"
                  }`}
                >
                  <p className="text-[11px] text-slate-500">Balance</p>
                  <p
                    className={`text-base font-extrabold mt-1 ${
                      balance > 0
                        ? "text-rose-600 dark:text-rose-400"
                        : "text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    {formatCurrency(balance)}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Link to={`/billing/folio/${selectedStay.id}`}>
                    <Button
                      size="sm"
                      variant="outline"
                      leftIcon={<Receipt className="w-3.5 h-3.5" />}
                    >
                      Open Full Folio
                    </Button>
                  </Link>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    resetPayment({
                      amount: balance > 0 ? balance : 0,
                      method: "CASH",
                      reference_number: "",
                    });
                    setShowPayment(true);
                  }}
                  leftIcon={<CreditCard className="w-4 h-4" />}
                >
                  Record Payment
                </Button>
              </div>

              <DataTable
                columns={paymentColumns}
                data={payments || []}
                emptyTitle="No payments recorded"
                emptyMessage="Record a payment to settle this folio."
              />
            </>
          )}
        </div>
      </div>

      {/* Record Payment Modal */}
      <Modal
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        title={`Record Payment — Room ${selectedStay?.room?.number || ""}`}
        description={
          selectedStay?.guest
            ? `Guest: ${selectedStay.guest.first_name} ${selectedStay.guest.last_name} • Balance: ${formatCurrency(balance)}`
            : undefined
        }
        size="sm"
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPayment(false)}
              disabled={recordPaymentMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              isLoading={recordPaymentMutation.isPending}
              onClick={handlePaymentSubmit((data) =>
                recordPaymentMutation.mutate({
                  stay_id: selectedStay!.id,
                  amount: data.amount,
                  method: data.method,
                  reference_number: data.reference_number?.trim() || undefined,
                })
              )}
            >
              Record Payment
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <FormField label="Amount" required error={paymentErrors.amount?.message}>
            <Controller
              name="amount"
              control={controlPayment}
              render={({ field }) => (
                <CurrencyInput value={field.value || 0} onChange={field.onChange} />
              )}
            />
          </FormField>
          <FormField label="Payment Method" required error={paymentErrors.method?.message}>
            <select
              {...registerPayment("method")}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>
                  {PAYMENT_METHOD_LABELS[m]}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Reference Number">
            <input
              type="text"
              {...registerPayment("reference_number")}
              placeholder="e.g. UTR / card last 4"
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
            />
          </FormField>
        </div>
      </Modal>

      {/* Refund confirm */}
      <ConfirmDialog
        isOpen={!!refundPayment}
        onClose={() => setRefundPayment(null)}
        onConfirm={() =>
          refundPayment &&
          refundMutation.mutate({
            id: refundPayment.id,
            amount: refundPayment.amount,
            reason: "Refunded from payments workbench",
          })
        }
        title="Refund payment?"
        message={`Refund ${formatCurrency(refundPayment?.amount || 0)} (${refundPayment ? PAYMENT_METHOD_LABELS[refundPayment.method] : ""}) back to the guest.`}
        confirmText="Process Refund"
        isLoading={refundMutation.isPending}
      />
    </div>
  );
};