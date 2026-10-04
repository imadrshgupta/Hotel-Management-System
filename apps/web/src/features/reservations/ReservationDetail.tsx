import React from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reservationsApi } from "@/services/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { formatCurrency } from "@/lib/utils";
import { useAppStore } from "@/store/app.store";
import { Check, Calendar, User, CreditCard } from "lucide-react";

export const ReservationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const addToast = useAppStore((s) => s.addToast);

  const { data: reservation, isLoading, isError, refetch } = useQuery({
    queryKey: ["reservation", id],
    queryFn: () => (id ? reservationsApi.get(id) : null),
    enabled: !!id,
  });

  const confirmMutation = useMutation({
    mutationFn: () => reservationsApi.confirm(id!),
    onSuccess: () => {
      addToast("Reservation confirmed", "success");
      queryClient.invalidateQueries({ queryKey: ["reservation", id] });
    },
    onError: (err: any) => addToast(err?.response?.data?.message || "Failed", "error"),
  });

  if (isLoading) return <LoadingState message="Loading reservation details..." />;
  if (isError || !reservation)
    return <ErrorState title="Reservation Not Found" onRetry={refetch} />;

  const primaryGuest = reservation.guests?.[0]?.guest;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title={`Booking #${reservation.confirmation_number}`}
        subtitle={`Created on ${new Date(reservation.created_at || Date.now()).toLocaleDateString()}`}
        breadcrumbs={[
          { label: "Reservations", path: "/reservations" },
          { label: reservation.confirmation_number },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge status={reservation.status} type="reservation" size="lg" />
            {reservation.status === "INQUIRY" && (
              <Button
                size="sm"
                variant="success"
                isLoading={confirmMutation.isPending}
                onClick={() => confirmMutation.mutate()}
                leftIcon={<Check className="w-4 h-4" />}
              >
                Confirm Booking
              </Button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              Primary Guest Profile
            </h3>
            {primaryGuest ? (
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 block">Full Name</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {primaryGuest.first_name} {primaryGuest.last_name}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Email</span>
                  <span className="font-semibold">{primaryGuest.email || "N/A"}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Phone</span>
                  <span className="font-semibold">{primaryGuest.phone || "N/A"}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">ID Document</span>
                  <span className="font-semibold">
                    {primaryGuest.id_type || "Passport"}: {primaryGuest.id_number || "-"}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">No primary guest attached.</p>
            )}
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              Reservation Parameters
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block">Check-in Date</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {reservation.check_in_date}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Check-out Date</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {reservation.check_out_date}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Room Category</span>
                <span className="font-semibold">{reservation.roomType?.name || "Standard"}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Booking Source</span>
                <span className="font-semibold">{reservation.source || "DIRECT"}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              Payment Summary
            </h3>
            <div className="space-y-2 text-xs border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex justify-between">
                <span className="text-slate-500">Estimated Total:</span>
                <span className="font-bold">{formatCurrency(reservation.total_amount || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Advance Deposit Paid:</span>
                <span className="font-bold text-emerald-600">
                  {formatCurrency(reservation.advance_paid || 0)}
                </span>
              </div>
            </div>
            <div className="flex justify-between text-xs font-bold pt-1">
              <span>Balance Due:</span>
              <span className="text-rose-600">
                {formatCurrency((reservation.total_amount || 0) - (reservation.advance_paid || 0))}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
