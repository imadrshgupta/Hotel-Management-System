import React from "react";
import { Construction, ExternalLink } from "lucide-react";

interface BackendDependencyNoticeProps {
  module: string;
  endpoints: string[];
  description?: string;
}

/**
 * Documented-dependency state: shown when a frontend module requires backend
 * endpoints that are not implemented yet. We deliberately render this instead
 * of mock data or fake success so the UI never pretends production
 * functionality exists (see project spec §36 / §40).
 */
export const BackendDependencyNotice: React.FC<BackendDependencyNoticeProps> = ({
  module,
  endpoints,
  description,
}) => {
  return (
    <div className="p-6 rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/60 dark:bg-amber-950/20 space-y-3">
      <div className="flex items-start gap-3">
        <div className="p-2.5 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 rounded-xl shrink-0">
          <Construction className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200">
            {module} — backend endpoint not implemented
          </h3>
          <p className="text-xs text-amber-800/80 dark:text-amber-300/70 mt-1 max-w-2xl">
            {description ||
              "This screen is a design placeholder. It will be wired to live data as soon as the backend route ships — no mock data is shown here."}
          </p>
        </div>
      </div>

      <div className="pl-11">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-700/70 dark:text-amber-400/60 mb-1.5">
          Required API contract
        </p>
        <ul className="space-y-1">
          {endpoints.map((endpoint) => (
            <li
              key={endpoint}
              className="flex items-center gap-2 text-xs font-mono text-amber-900 dark:text-amber-200 bg-white/60 dark:bg-slate-900/40 border border-amber-200/70 dark:border-amber-900/40 rounded-lg px-2.5 py-1.5 w-fit"
            >
              <ExternalLink className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />
              {endpoint}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};