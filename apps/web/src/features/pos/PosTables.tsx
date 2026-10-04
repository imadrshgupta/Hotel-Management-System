import React from "react";
import { useQuery } from "@tanstack/react-query";
import { posApi } from "@/services/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { BackendDependencyNotice } from "@/components/ui/BackendDependencyNotice";
import { useRealtimeInvalidate } from "@/hooks/useRealtimeInvalidate";
import { Link } from "react-router-dom";
import { ShoppingBag, UtensilsCrossed, ClipboardList } from "lucide-react";
import type { Order } from "@/types";

export const PosTables: React.FC = () => {
  const { data: ordersData, isLoading, isError, refetch } = useQuery({
    queryKey: ["pos", "orders"],
    queryFn: () => posApi.listOrders({ limit: 25 }),
  });

  // Live updates: new orders refresh the active-orders panel instantly
  useRealtimeInvalidate({
    "order:created": [["pos"]],
    "order:posted_to_room": [["pos"]],
  });

  const orders: Order[] = Array.isArray(ordersData?.data)
    ? ordersData.data
    : Array.isArray(ordersData)
    ? (ordersData as any)
    : [];

  const openOrders = orders.filter(
    (o) => !["COMPLETED", "CANCELLED"].includes(o.status)
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Restaurant & Bar Tables"
        subtitle="Manage seating layout and select table to create orders."
        breadcrumbs={[{ label: "POS" }, { label: "Tables" }]}
        actions={
          <Link to="/pos/orders">
            <Button size="sm" leftIcon={<ShoppingBag className="w-4 h-4" />}>
              Direct POS Order
            </Button>
          </Link>
        }
      />

      <div className="flex items-center gap-3 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300">
          <UtensilsCrossed className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">
            Live table occupancy & open orders
          </p>
          <p className="text-xs text-slate-500">
            The table layout loads from the backend once the tables endpoint ships.
          </p>
        </div>
      </div>

      <BackendDependencyNotice
        module="POS Tables"
        description="The table layout endpoint is not implemented in the API yet. This section will render the interactive table grid (AVAILABLE / OCCUPIED / RESERVED) as soon as the route ships. Meanwhile, real open orders are shown below."
        endpoints={[
          "GET    /pos/tables",
          "GET    /pos/menu",
          "POST   /pos/orders (create)",
          "POST   /pos/:id/post-to-room",
        ]}
      />

      {/* Real open orders */}
      <div className="space-y-3">
        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-blue-600" />
          Active Orders ({openOrders.length})
        </h3>

        {isLoading ? (
          <LoadingState message="Loading active orders..." />
        ) : isError ? (
          <ErrorState title="Failed to load orders" onRetry={refetch} />
        ) : openOrders.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border">
            No active orders right now.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {openOrders.map((order) => (
              <div
                key={order.id}
                className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                    {order.order_number}
                    {order.room_number ? ` (Room ${order.room_number})` : ""}
                    {order.table?.number ? ` • Table ${order.table.number}` : ""}
                  </span>
                  <StatusBadge status={order.status} type="order" size="sm" />
                </div>
                <p className="text-[11px] text-slate-500">
                  {order.items?.length || 0} items • {order.order_type}
                </p>
                <Link to={`/pos/orders?orderId=${order.id}`} className="block">
                  <Button size="sm" variant="outline" className="w-full">
                    View Order
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};