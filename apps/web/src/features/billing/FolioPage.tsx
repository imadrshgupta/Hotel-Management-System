import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useAppStore } from "@/store/app.store";
import { useRealtimeInvalidate } from "@/hooks/useRealtimeInvalidate";
import { FOLIO_CATEGORIES, FOLIO_CATEGORY_LABELS, PAYMENT_METHODS, PAYMENT_METHOD_LABELS } from "@/constants";
import { folioChargeSchema, paymentSchema, type FolioChargeFormData, type PaymentFormData } from "@/lib/validation";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import {
  Plus,
  CreditCard,
  Trash2,
  Receipt,
  ArrowLeft,
  Percent,
  BadgePercent,
  Wallet,
  Undo2,
} from "lucide-react";
import type { FolioItem, Payment } from "@/types";

export const FolioPage: React.FC = () => {
  const { stayId } = useParams<{ stayId: string }>();
  const queryClient = useQueryClient();
  const addToast = useAppStore((s) => s.addToast);

  // Live updates: new payments on this property refresh folio + payments
  useRealtimeInvalidate({
    "payment:created": [["folios"], ["payments"]],
  });

  // ── Data ────────────────────────────────────────────────────
  const { data: stay, isLoading: isLoadingStay } = useQuery({
    queryKey: ["stays", stayId],
    queryFn: () => staysApi.get(stayId!),
    enabled: !!stayId,
  });

  const {
    data: folio,
    isLoading: isLoadingFolio,
    isError: isFolioError,
    refetch: refetchFolio,
  } = useQuery({
    queryKey: ["folios", "stay", stayId],
    queryFn: () => foliosApi.getByStay(stayId!),
    enabled: !!stayId,
  });

  const { data: payments } = useQuery({
    queryKey: ["payments", "folio", folio?.id],
    queryFn: () => paymentsApi.getByFolio(folio!.id),
    enabled: !!folio?.id,
  });

  // ── UI state ────────────────────────────────────────────────
  const [showAddCharge, setShowAddCharge] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [removeItem, setRemoveItem] = useState<FolioItem | null>(null);
  const [refundPayment, setRefundPayment] = useState<Payment | null>(null);

  // ── Mutations ───────────────────────────────────────────────
  const addChargeMutation = useMutation({
    mutationFn: (data: {
      description: string;
      category: string;
      quantity: number;
      unit_price: number;
      tax_amount?: number;
      discount_amount?: number;
    }) => foliosApi.addItem(folio!.id, data),
    onSuccess: () => {
      addToast("Charge posted to folio", "success");
      queryClient.invalidateQueries({ queryKey: ["folios"] });
      setShowAddCharge(false);
    },
    onError: (err: any) =>
      addToast(err?.response?.data?.message || "Failed to post charge", "error"),
  });

  const removeItemMutation = useMutation({
    mutationFn: (item: FolioItem) => foliosApi.removeItem(folio!.id, item.id),
    onSuccess: () => {
      addToast("Folio item removed", "success");
      queryClient.invalidateQueries({ queryKey: ["folios"] });
      setRemoveItem(null);
    },
    onError: (err: any) =>
      addToast(err?.response?.data?.message || "Failed to remove item", "error"),
  });

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

  // ── Loading / Error ─────────────────────────────────────────
  if (isLoadingStay || isLoadingFolio) {
    return <LoadingState message="Loading folio..." />;
  }

  if (isFolioError) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Guest Folio"
          breadcrumbs={[{ label: "Billing" }, { label: "Folio" }]}
        />
        <ErrorState
          title="No open folio found"
          message="This stay has no open folio. Check-ins create a folio automatically; if the stay was already checked out, its folio is closed."
          onRetry={refetchFolio}
        />
      </div>
    );
  }

  if (!folio) return null;

  const guestName = stay?.guest
    ? `${stay.guest.first_name} ${stay.guest.last_name}`
    : "Guest";
  const roomNumber = stay?.room?.number || "—";

  const balance = Number(folio.balance || 0);

  // ── Columns ─────────────────────────────────────────────────
  const itemColumns: Column<FolioItem>[] = [
    {
      header: "Date",
      cell: (i) => (
        <span className="text-xs whitespace-nowrap">{formatDateTime(i.posted_at)}</span>
      ),
    },
    { header: "Description", accessorKey: "description" },
    {
      header: "Category",
      cell: (i) => FOLIO_CATEGORY_LABELS[i.category] || i.category,
    },
    { header: "Qty", accessorKey: "quantity" },
    {
      header: "Rate",
      cell: (i) => formatCurrency(i.unit_price),
    },
    {
      header: "Tax",
      cell: (i) => formatCurrency(i.tax_amount),
    },
    {
      header: "Discount",
      cell: (i) => (i.discount_amount ? `-${formatCurrency(i.discount_amount)}` : "—"),
    },
    {
      header: "Net",
      cell: (i) => (
        <span className="font-bold text-slate-900 dark:text-white">
          {formatCurrency(i.net_amount)}
        </span>
      ),
    },
    {
      header: "",
      cell: (i) => (
        <button
          onClick={() => setRemoveItem(i)}
          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
          title="Remove item"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      ),
    },
  ];

  const paymentColumns: Column<Payment>[] = [
    {
      header: "Date",
      cell: (p) => (
        <span className="text-xs whitespace-nowrap">{formatDateTime(p.processed_at)}</span>
      ),
    },
    {
      header: "Method",
      cell: (p) => PAYMENT_METHOD_LABELS[p.method] || p.method,
    },
    {
      header: "Reference",
      cell: (p) => p.reference_number || "—",
    },
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
        title={`Folio — Room ${roomNumber}`}
        subtitle={`${guestName} • ${stay?.check_in_date} → ${stay?.check_out_date}`}
        breadcrumbs={[
          { label: "Billing", path: "/billing/payments" },
          { label: "Folio" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link to="/billing/payments">
              <Button size="sm" variant="outline" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Back to Payments
              </Button>
            </Link>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowAddCharge(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Charge
            </Button>
            <Button
              size="sm"
              onClick={() => setShowPayment(true)}
              leftIcon={<CreditCard className="w-4 h-4" />}
            >
              Record Payment
            </Button>
          </div>
        }
      />

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <p className="text-[11px] text-slate-500 flex items-center gap-1">
            <Receipt className="w-3 h-3" /> Charges
          </p>
          <p className="text-base font-bold mt-1">{formatCurrency(folio.total_charges)}</p>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <p className="text-[11px] text-slate-500 flex items-center gap-1">
            <Percent className="w-3 h-3" /> Taxes
          </p>
          <p className="text-base font-bold mt-1">{formatCurrency(folio.total_taxes)}</p>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <p className="text-[11px] text-slate-500 flex items-center gap-1">
            <BadgePercent className="w-3 h-3" /> Discounts
          </p>
          <p className="text-base font-bold mt-1">
            {folio.total_discounts ? `-${formatCurrency(folio.total_discounts)}` : "—"}
          </p>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <p className="text-[11px] text-slate-500 flex items-center gap-1">
            <Wallet className="w-3 h-3" /> Paid
          </p>
          <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {formatCurrency(folio.total_payments)}
          </p>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <p className="text-[11px] text-slate-500 flex items-center gap-1">
            <Undo2 className="w-3 h-3" /> Refunds
          </p>
          <p className="text-base font-bold mt-1">
            {folio.total_refunds ? formatCurrency(folio.total_refunds) : "—"}
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

      {/* Folio items */}
      <DataTable
        columns={itemColumns}
        data={folio.items || []}
        emptyTitle="No charges posted"
        emptyMessage="Post room charges, POS, minibar, or other services to this folio."
      />

      {/* Payments */}
      <DataTable
        columns={paymentColumns}
        data={payments || []}
        emptyTitle="No payments recorded"
        emptyMessage="Record a payment to settle this folio."
      />

      {/* Add Charge Modal */}
      <AddChargeModal
        isOpen={showAddCharge}
        onClose={() => setShowAddCharge(false)}
        isLoading={addChargeMutation.isPending}
        onSubmit={(data) => addChargeMutation.mutate(data)}
      />

      {/* Record Payment Modal */}
      <RecordPaymentModal
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        isLoading={recordPaymentMutation.isPending}
        balance={balance}
        onSubmit={(data) =>
          recordPaymentMutation.mutate({ stay_id: stayId!, ...data })
        }
      />

      {/* Remove item confirm */}
      <ConfirmDialog
        isOpen={!!removeItem}
        onClose={() => setRemoveItem(null)}
        onConfirm={() => removeItem && removeItemMutation.mutate(removeItem)}
        title="Remove folio item?"
        message={`This will permanently remove "${removeItem?.description}" (${formatCurrency(removeItem?.net_amount || 0)}) from the folio and recalculate the balance.`}
        confirmText="Remove Item"
        isLoading={removeItemMutation.isPending}
      />

      {/* Refund confirm */}
      <ConfirmDialog
        isOpen={!!refundPayment}
        onClose={() => setRefundPayment(null)}
        onConfirm={() =>
          refundPayment &&
          refundMutation.mutate({
            id: refundPayment.id,
            amount: refundPayment.amount,
            reason: "Refunded from folio",
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

// ─── Add Charge Modal ──────────────────────────────────────────
interface AddChargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  onSubmit: (data: {
    description: string;
    category: string;
    quantity: number;
    unit_price: number;
    tax_amount?: number;
    discount_amount?: number;
  }) => void;
}

const AddChargeModal: React.FC<AddChargeModalProps> = ({
  isOpen,
  onClose,
  isLoading,
  onSubmit,
}) => {
  const {
    register,
    control,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<FolioChargeFormData>({
    resolver: zodResolver(folioChargeSchema),
    defaultValues: {
      description: "",
      category: FOLIO_CATEGORIES[0],
      quantity: 1,
      unit_price: 0,
      tax_amount: 0,
      discount_amount: 0,
    },
  });

  const values = watch();
  const net =
    (values.quantity || 0) * (values.unit_price || 0) +
    (values.tax_amount || 0) -
    (values.discount_amount || 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Post Charge to Folio"
      description="Add a room charge, POS, minibar, or other service line."
      size="md"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit(onSubmit)} isLoading={isLoading}>
            Post Charge
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <FormField label="Description" required error={errors.description?.message}>
          <input
            type="text"
            {...register("description")}
            placeholder="e.g. Minibar — Sprite 330ml"
            className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
          />
        </FormField>

        <FormField label="Category" required error={errors.category?.message}>
          <select
            {...register("category")}
            className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
          >
            {FOLIO_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {FOLIO_CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Quantity" required error={errors.quantity?.message}>
            <input
              type="number"
              min="0"
              step="1"
              {...register("quantity")}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
            />
          </FormField>
          <FormField label="Unit Price" required error={errors.unit_price?.message}>
            <Controller
              name="unit_price"
              control={control}
              render={({ field }) => <CurrencyInput value={field.value || 0} onChange={field.onChange} />}
            />
          </FormField>
          <FormField label="Tax Amount" error={errors.tax_amount?.message}>
            <Controller
              name="tax_amount"
              control={control}
              render={({ field }) => <CurrencyInput value={field.value || 0} onChange={field.onChange} />}
            />
          </FormField>
          <FormField label="Discount Amount" error={errors.discount_amount?.message}>
            <Controller
              name="discount_amount"
              control={control}
              render={({ field }) => <CurrencyInput value={field.value || 0} onChange={field.onChange} />}
            />
          </FormField>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-sm">
          <span className="text-xs font-semibold text-slate-500">Net Amount</span>
          <span className="font-bold text-slate-900 dark:text-white">
            {formatCurrency(net)}
          </span>
        </div>
      </div>
    </Modal>
  );
};

// ─── Record Payment Modal ──────────────────────────────────────
interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  balance: number;
  onSubmit: (data: {
    amount: number;
    method: string;
    reference_number?: string;
    notes?: string;
  }) => void;
}

const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  isOpen,
  onClose,
  isLoading,
  balance,
  onSubmit,
}) => {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: balance > 0 ? balance : 0,
      method: "CASH",
      reference_number: "",
    },
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Payment"
      description={`Outstanding balance: ${formatCurrency(balance)}`}
      size="sm"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit((data) =>
              onSubmit({
                amount: data.amount,
                method: data.method,
                reference_number: data.reference_number?.trim() || undefined,
              })
            )}
            isLoading={isLoading}
          >
            Record Payment
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <FormField label="Amount" required error={errors.amount?.message}>
          <Controller
            name="amount"
            control={control}
            render={({ field }) => <CurrencyInput value={field.value || 0} onChange={field.onChange} />}
          />
        </FormField>

        <FormField label="Payment Method" required error={errors.method?.message}>
          <select
            {...register("method")}
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
            {...register("reference_number")}
            placeholder="e.g. UTR / card last 4 / cheque #"
            className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
          />
        </FormField>
      </div>
    </Modal>
  );
};