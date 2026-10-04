import React from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { BackendDependencyNotice } from "@/components/ui/BackendDependencyNotice";

export const InventoryStock: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Stock Levels"
        subtitle="Current, available, reserved, and low-stock positions per item."
        breadcrumbs={[{ label: "Inventory" }, { label: "Stock" }]}
      />
      <BackendDependencyNotice
        module="Inventory Stock"
        description="The stock ledger endpoints are not implemented in the API yet. Live stock positions will render here once the routes ship."
        endpoints={[
          "GET    /inventory/stock",
          "GET    /inventory/stock/transactions",
          "POST   /inventory/stock/adjust",
        ]}
      />
    </div>
  );
};