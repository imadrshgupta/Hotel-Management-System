import React from "react";
import { BackendDependencyNotice } from "@/components/ui/BackendDependencyNotice";
import { Receipt } from "lucide-react";

/**
 * Taxes, Discounts, Rate Plans & Payment Methods settings.
 *
 * The backend has models (tax, discount, membership-plan, payment) but no
 * routes for these configuration entities, so this screen documents the
 * dependency instead of faking saveable settings.
 */
export const SettingsTaxes: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300">
          <Receipt className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">
            Taxes, Discounts, Rate Plans & Payment Methods
          </p>
          <p className="text-xs text-slate-500">
            Configuration for billing rules and accepted payment methods.
          </p>
        </div>
      </div>

      <BackendDependencyNotice
        module="Taxes & Policies"
        description="No backend endpoints exist yet for taxes, discounts, rate plans, or payment methods (models only). These settings will be editable here once the routes ship."
        endpoints={[
          "GET/POST    /taxes",
          "GET/POST    /discounts",
          "GET/POST    /rate-plans",
          "GET/POST    /payment-methods",
          "GET/POST    /policies",
        ]}
      />
    </div>
  );
};