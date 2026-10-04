import React from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { BackendDependencyNotice } from "@/components/ui/BackendDependencyNotice";

export const InventoryVendors: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Vendors"
        subtitle="Supplier directory, contacts, payment terms, and ratings."
        breadcrumbs={[{ label: "Inventory" }, { label: "Vendors" }]}
      />
      <BackendDependencyNotice
        module="Inventory Vendors"
        description="The vendor endpoints are not implemented in the API yet. The supplier directory will render here once the routes ship."
        endpoints={[
          "GET    /inventory/vendors",
          "POST   /inventory/vendors",
          "PATCH  /inventory/vendors/:id",
        ]}
      />
    </div>
  );
};