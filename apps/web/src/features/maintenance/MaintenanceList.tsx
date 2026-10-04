import React from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { BackendDependencyNotice } from "@/components/ui/BackendDependencyNotice";
import { Wrench } from "lucide-react";

/**
 * Maintenance module.
 *
 * The backend has no maintenance routes yet (models exist only), so this
 * screen is a documented dependency placeholder. It intentionally renders no
 * mock tickets — per project spec §36, the UI must never fake production data.
 */
export const MaintenanceList: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Maintenance Ticket Management"
        subtitle="Track engineering issues, plumbing, electrical, and room repairs."
        breadcrumbs={[{ label: "Maintenance" }, { label: "Tickets" }]}
      />

      <div className="flex items-center gap-3 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300">
          <Wrench className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">
            Ticket list, detail view, and status workflow
          </p>
          <p className="text-xs text-slate-500">
            Room, issue, priority, technician, status, and notes — plus filters by priority/status.
          </p>
        </div>
      </div>

      <BackendDependencyNotice
        module="Maintenance"
        description="The maintenance module cannot connect to live data yet: the API exposes no maintenance endpoints. Once the routes ship, this screen will show real tickets, assignment, and status updates."
        endpoints={[
          "GET    /maintenance",
          "GET    /maintenance/:id",
          "POST   /maintenance",
          "PATCH  /maintenance/:id",
        ]}
      />
    </div>
  );
};