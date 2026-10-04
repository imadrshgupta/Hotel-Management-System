import React from "react";
import { useQuery } from "@tanstack/react-query";
import { posApi } from "@/services/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { useRealtimeInvalidate } from "@/hooks/useRealtimeInvalidate";
import type { Order } from "@/types";

export const PosKotView: React.FC = () => {
  const { data: response, isLoading, isError, refetch } = useQuery({
    queryKey: ["pos", "orders"],
    queryFn: () => posApi.listOrders({ limit: 50 }),
    refetchInterval: 10000,
  });

  // Live updates: new orders & room-posted orders refresh the board instantly
  useRealtimeInvalidate({
    "order:created": [["pos"]],
    "order:posted_to_room": [["pos"]],
  });

  if (isLoading) return <LoadingState message="Connecting to Kitchen Display System..." />;
  if (isError) return <ErrorState title="Failed to load orders" onRetry={refetch} />;

  const orders: Order[] = Array.isArray(response?.data)
    ? response.data
    : Array.isArray(response)
    ? (response as any)
    : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kitchen Display System (KDS / KOT)"
        subtitle="Live kitchen order ticket board for chef and kitchen staff."
        breadcrumbs={[{ label: "POS" }, { label: "Kitchen Display" }]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {orders.length === 0 ? (
          <div className="col-span-full p-8 text-center text-xs text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border">
            No active kitchen order tickets right now.
          </div>
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Order #{order.order_number} {order.room_number ? `(Room ${order.room_number})` : ""}
                </span>
                <StatusBadge status={order.status} type="order" size="sm" />
              </div>

              <div className="space-y-1">
                {order.items?.map((item, idx) => (
                  <div key={item.id || idx} className="flex justify-between text-xs font-semibold">
                    <span>{item.quantity}x {item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
