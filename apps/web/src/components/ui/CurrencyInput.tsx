import React from "react";

interface CurrencyInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value: number | string;
  onChange: (val: number) => void;
  currencySymbol?: string;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  value,
  onChange,
  currencySymbol = "$",
  className = "",
  disabled,
  ...props
}) => {
  return (
    <div className="relative flex items-center">
      <span className="absolute left-3 text-sm font-semibold text-slate-400 dark:text-slate-500 pointer-events-none">
        {currencySymbol}
      </span>
      <input
        type="number"
        step="0.01"
        value={value === 0 ? "0" : value || ""}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        disabled={disabled}
        className={`w-full pl-7 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all ${className}`}
        {...props}
      />
    </div>
  );
};
