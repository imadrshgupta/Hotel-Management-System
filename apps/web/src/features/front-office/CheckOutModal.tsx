import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { staysApi, foliosApi, invoicesApi, paymentsApi } from "@/services/api";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { useAppStore } from "@/store/app.store";
import { formatCurrency } from "@/lib/utils";
import { CheckCircle2, Receipt, CreditCard, AlertCircle } from "lucide-react";
import type { Stay } from "@/types";

interface CheckOutModalProps {
  isOpen: boolean;
  onClose: () => void;
  stay: Stay | null;
}

export const CheckOutModal: React.FC<CheckOutModalProps> = ({
  isOpen,
  onClose,
  stay,
}) => {
  const queryClient = useQueryClient();
  const addToast = useAppStore((s) => s.addToast);

  const [paymentMethod, setPaymentMethod] = useState<string>("CASH");
  const [paymentAmount, setPaymentAmount] = useState<number>(0);

  const { data: folio, isLoading: isLoadingFolio } = useQuery({
    queryKey: ["folio", stay?.id],
    queryFn: () => (stay ? foliosApi.getByStay(stay.id) : null),
    enabled: !!stay?.id,
  });

  const checkOutMutation = useMutation({
    mutationFn: () => staysApi.checkOut(stay!.id),
    onSuccess: () => {
      addToast("Guest checked out successfully!", "success");
      queryClient.invalidateQueries({ queryKey: ["stays"] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      onClose();
    },
    onError: (err: any) => {
      addToast(err?.response?.data?.message || "Check-out failed", "error");
    },
  });

  const addPaymentMutation = useMutation({
    mutationFn: paymentsApi.create,
    onSuccess: () => {
      addToast("Payment recorded successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["folio", stay?.id] });
      setPaymentAmount(0);
    },
    onError: (err: any) => {
      addToast(err?.response?.data?.message || "Payment failed", "error");
    },
  });

  const handleSettlePayment = () => {
    if (!folio || paymentAmount <= 0) return;
    addPaymentMutation.mutate({
      stay_id: stay!.id,
      amount: paymentAmount,
      method: paymentMethod as any,
    });
  };

  const balance = folio?.balance || 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Check-out & Billing Summary — Room ${stay?.room?.number || ""}`}
      description={`Guest: ${stay?.guest?.first_name} ${stay?.guest?.last_name}`}
      size="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button
            size="sm"
            variant="danger"
            isLoading={checkOutMutation.isPending}
            disabled={balance > 0}
            onClick={() => checkOutMutation.mutate()}
            leftIcon={<CheckCircle2 className="w-4 h-4" />}
          >
            Confirm Check-Out
          </Button>
        </div>
      }
    >
      {isLoadingFolio ? (
        <p className="text-xs text-slate-500 py-4 text-center">Loading folio breakdown...</p>
      ) : (
        <div className="space-y-5">
          {/* Summary Financial Banner */}
          <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-center">
            <div>
              <span className="text-[11px] text-slate-500 block">Total Charges</span>
              <span className="text-base font-bold text-slate-900 dark:text-white">
                {formatCurrency(folio?.total_charges || 0)}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block">Total Paid</span>
              <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(folio?.total_payments || 0)}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block">Outstanding Balance</span>
              <span className={`text-base font-bold ${balance > 0 ? "text-rose-600" : "text-slate-900 dark:text-white"}`}>
                {formatCurrency(balance)}
              </span>
            </div>
          </div>

          {balance > 0 && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 space-y-3">
              <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-bold text-xs">
                <AlertCircle className="w-4 h-4" />
                <span>Outstanding balance must be settled before checkout.</span>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="py-2 px-3 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  <option value="CASH">Cash</option>
                  <option value="CARD">Card</option>
                  <option value="UPI">UPI</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                </select>
                <CurrencyInput
                  value={paymentAmount || balance}
                  onChange={setPaymentAmount}
                  className="w-36"
                />
                <Button
                  size="sm"
                  isLoading={addPaymentMutation.isPending}
                  onClick={handleSettlePayment}
                >
                  Collect Payment
                </Button>
              </div>
            </div>
          )}

          {/* Folio Items Table */}
          <div>
            <h5 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-2">
              Folio Charges & Services
            </h5>
            <div className="max-h-48 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800">
              {folio?.items?.length === 0 ? (
                <p className="p-3 text-xs text-slate-500 text-center">No charges posted</p>
              ) : (
                folio?.items?.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-2.5 text-xs">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{item.description}</p>
                      <p className="text-[11px] text-slate-500">{item.category}</p>
                    </div>
                    <span className="font-bold">{formatCurrency(item.amount)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};
