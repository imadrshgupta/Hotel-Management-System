import React from "react";
import { SearchInput } from "./SearchInput";
import { Filter, RotateCcw } from "lucide-react";
import { Button } from "./Button";

interface FilterBarProps {
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  searchPlaceholder?: string;
  children?: React.ReactNode;
  onReset?: () => void;
  className?: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  children,
  onReset,
  className = "",
}) => {
  return (
    <div
      className={`flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs ${className}`}
    >
      <div className="flex flex-1 items-center gap-3 flex-wrap">
        {onSearchChange && (
          <SearchInput
            value={searchValue}
            onChange={onSearchChange}
            placeholder={searchPlaceholder}
            className="w-full md:w-72"
          />
        )}
        {children}
      </div>

      {onReset && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          className="text-slate-500 hover:text-slate-700 dark:text-slate-400 self-end md:self-auto"
        >
          Reset Filters
        </Button>
      )}
    </div>
  );
};
