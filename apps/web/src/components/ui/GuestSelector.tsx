import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { guestsApi } from "@/services/api";
import { SearchInput } from "./SearchInput";
import { User, Check, Plus } from "lucide-react";
import type { Guest } from "@/types";

interface GuestSelectorProps {
  selectedGuestId?: string;
  onSelect: (guest: Guest) => void;
  onCreateNew?: () => void;
}

export const GuestSelector: React.FC<GuestSelectorProps> = ({
  selectedGuestId,
  onSelect,
  onCreateNew,
}) => {
  const [search, setSearch] = useState("");

  const { data: response, isLoading } = useQuery({
    queryKey: ["guests", "selector", search],
    queryFn: () => guestsApi.list({ search, limit: 10 }),
  });

  const guests = response?.data || [];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search guest by name, email or phone..."
          className="flex-1"
        />
        {onCreateNew && (
          <button
            type="button"
            onClick={onCreateNew}
            className="flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline px-2 py-1"
          >
            <Plus className="w-3.5 h-3.5" />
            New Guest
          </button>
        )}
      </div>

      <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/50">
        {isLoading ? (
          <p className="p-3 text-xs text-slate-500 text-center">Loading guests...</p>
        ) : guests.length === 0 ? (
          <p className="p-3 text-xs text-slate-500 text-center">No guests found</p>
        ) : (
          guests.map((g) => {
            const isSelected = g.id === selectedGuestId;
            return (
              <div
                key={g.id}
                onClick={() => onSelect(g)}
                className={`flex items-center justify-between p-2.5 cursor-pointer text-xs transition-colors ${
                  isSelected
                    ? "bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 font-semibold"
                    : "hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {g.first_name} {g.last_name}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {g.email || g.phone || "No contact info"}
                    </p>
                  </div>
                </div>
                {isSelected && <Check className="w-4 h-4 text-blue-600" />}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
