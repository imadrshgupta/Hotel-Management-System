import React from "react";

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  helpText?: string;
  children: React.ReactNode;
  className?: string;
  htmlFor?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  required,
  helpText,
  children,
  className = "",
  htmlFor,
}) => {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label
        htmlFor={htmlFor}
        className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300"
      >
        {label}
        {required && <span className="text-rose-500 ml-1">*</span>}
      </label>
      {children}
      {error && <p className="text-xs font-medium text-rose-500 mt-1">{error}</p>}
      {helpText && !error && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{helpText}</p>
      )}
    </div>
  );
};
