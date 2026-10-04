import React from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { BackendDependencyNotice } from "@/components/ui/BackendDependencyNotice";

export const InventoryPurchaseOrders: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Purchase Orders"
        subtitle="Vendor POs, approvals, goods receipts, and delivery tracking."
        breadcrumbs={[{ label: "Inventory" }, { label: "Purchase Orders" }]}
      />
      <BackendDependencyNotice
        module="Purchase Orders"
        description="The purchasing endpoints are not implemented in the API yet. PO creation, approval, and goods receipt will render here once the routes ship."
        endpoints={[
          "GET    /inventory/purchase-orders",
          "POST   /inventory/purchase-orders",
          "POST   /inventory/purchase-orders/:id/approve",
          "POST   /inventory/goods-receipts",
        ]}
      />
    </div>
  );
};