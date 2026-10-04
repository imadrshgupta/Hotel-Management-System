import React from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { BackendDependencyNotice } from "@/components/ui/BackendDependencyNotice";
import { PartyPopper } from "lucide-react";

/**
 * Banquet module.
 *
 * The backend has banquet models (halls, events, packages, items) but no
 * routes yet, so this screen is a documented dependency placeholder.
 */
export const BanquetEvents: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Banquet & Events"
        subtitle="Halls, events, packages, equipment, and advance billing."
        breadcrumbs={[{ label: "Banquet" }]}
      />

      <div className="flex items-center gap-3 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300">
          <PartyPopper className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">
            Halls, events, guest counts, packages & advances
          </p>
          <p className="text-xs text-slate-500">
            Calendar/list views for events and hall availability.
          </p>
        </div>
      </div>

      <BackendDependencyNotice
        module="Banquet & Events"
        description="The banquet endpoints are not implemented in the API yet (models only). Hall bookings, events, and billing will render here once the routes ship."
        endpoints={[
          "GET/POST    /banquet/halls",
          "GET/POST    /banquet/events",
          "POST        /banquet/events/:id/advance",
          "POST        /banquet/events/:id/bill",
        ]}
      />
    </div>
  );
};