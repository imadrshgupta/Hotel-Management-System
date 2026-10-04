import React, { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";

interface SearchInputProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  debounceMs?: number;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value: externalValue = "",
  onChange,
  placeholder = "Search...",
  className = "",
  debounceMs = 300,
}) => {
  const [internalValue, setInternalValue] = useState(externalValue);
  const debouncedValue = useDebounce(internalValue, debounceMs);

  useEffect(() => {
    setInternalValue(externalValue);
  }, [externalValue]);

  useEffect(() => {
    onChange(debouncedValue);
  }, [debouncedValue, onChange]);

  return (
    <div className={`relative flex items-center ${className}`}>
      <Search className="absolute left-3 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
      <input
        type="text"
        value={internalValue}
        onChange={(e) => setInternalValue(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-8 py-2 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all duration-200"
      />
      {internalValue && (
        <button
          type="button"
          onClick={() => {
            setInternalValue("");
            onChange("");
          }}
          className="absolute right-2.5 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-md"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
