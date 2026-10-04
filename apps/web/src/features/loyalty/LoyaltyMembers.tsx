import React from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { BackendDependencyNotice } from "@/components/ui/BackendDependencyNotice";
import { Crown } from "lucide-react";

/**
 * Loyalty / Membership module.
 *
 * The backend has membership models (plans, members, loyalty transactions)
 * but no routes yet, so this screen is a documented dependency placeholder.
 */
export const LoyaltyMembers: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Membership & Loyalty"
        subtitle="Members, plans, points, transactions, and redemptions."
        breadcrumbs={[{ label: "Loyalty" }]}
      />

      <div className="flex items-center gap-3 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300">
          <Crown className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">
            Member profiles, points balance & redemption history
          </p>
          <p className="text-xs text-slate-500">
            Benefits and tier progression per membership plan.
          </p>
        </div>
      </div>

      <BackendDependencyNotice
        module="Membership & Loyalty"
        description="The loyalty endpoints are not implemented in the API yet (models only). Member profiles, points, and redemptions will render here once the routes ship."
        endpoints={[
          "GET/POST    /loyalty/plans",
          "GET/POST    /loyalty/members",
          "GET         /loyalty/members/:id/transactions",
          "POST        /loyalty/members/:id/redeem",
        ]}
      />
    </div>
  );
};