import React from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { BackendDependencyNotice } from "@/components/ui/BackendDependencyNotice";
import { Package } from "lucide-react";

/**
 * Inventory module.
 *
 * The backend has inventory models (items, categories, units, vendors,
 * purchase orders, goods receipts) but no routes yet, so this screen is a
 * documented dependency placeholder — no mock stock is rendered.
 */
export const InventoryItems: React.FC = () => {

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory Items Catalog"
        subtitle="Manage hotel stock, minimum reorder levels, and SKU tracking."
        breadcrumbs={[{ label: "Inventory" }, { label: "Items Catalog" }]}
      />

      <div className="flex items-center gap-3 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300">
          <Package className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">
            Items, stock levels, vendors & purchase orders
          </p>
          <p className="text-xs text-slate-500">
            Current / available / reserved / low-stock indicators, reorder points, and receipts.
          </p>
        </div>
      </div>

      <BackendDependencyNotice
        module="Inventory"
        description="The inventory module cannot connect to live data yet: the API exposes no inventory endpoints. Once the routes ship, this screen will show the real item catalog with live stock levels."
        endpoints={[
          "GET    /inventory/items",
          "GET    /inventory/stock",
          "GET    /inventory/vendors",
          "GET    /inventory/purchase-orders",
          "GET    /inventory/goods-receipts",
        ]}
      />

    </div>
  );
};