import React from "react";
import {
  ROOM_STATUS_LABELS,
  ROOM_STATUS_COLORS,
  RESERVATION_STATUS_LABELS,
  RESERVATION_STATUS_COLORS,
  HOUSEKEEPING_STATUS_LABELS,
  HOUSEKEEPING_STATUS_COLORS,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  INVOICE_STATUS_LABELS,
  INVOICE_STATUS_COLORS,
  PO_STATUS_LABELS,
  PO_STATUS_COLORS,
  PRIORITY_LABELS,
  PRIORITY_COLORS,
} from "@/constants";

interface StatusBadgeProps {
  status: string;
  type?:
    | "room"
    | "reservation"
    | "housekeeping"
    | "order"
    | "invoice"
    | "po"
    | "priority"
    | "generic";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  type = "generic",
  size = "md",
  className = "",
}) => {
  let label = status;
  let colorClass = "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700";

  switch (type) {
    case "room":
      label = ROOM_STATUS_LABELS[status] || status;
      colorClass = ROOM_STATUS_COLORS[status] || colorClass;
      break;
    case "reservation":
      label = RESERVATION_STATUS_LABELS[status] || status;
      colorClass = RESERVATION_STATUS_COLORS[status] || colorClass;
      break;
    case "housekeeping":
      label = HOUSEKEEPING_STATUS_LABELS[status] || status;
      colorClass = HOUSEKEEPING_STATUS_COLORS[status] || colorClass;
      break;
    case "order":
      label = ORDER_STATUS_LABELS[status] || status;
      colorClass = ORDER_STATUS_COLORS[status] || colorClass;
      break;
    case "invoice":
      label = INVOICE_STATUS_LABELS[status] || status;
      colorClass = INVOICE_STATUS_COLORS[status] || colorClass;
      break;
    case "po":
      label = PO_STATUS_LABELS[status] || status;
      colorClass = PO_STATUS_COLORS[status] || colorClass;
      break;
    case "priority":
      label = PRIORITY_LABELS[status] || status;
      colorClass = PRIORITY_COLORS[status] || colorClass;
      break;
    default:
      label = status.replace(/_/g, " ");
      break;
  }

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs rounded-md font-medium",
    md: "px-2.5 py-1 text-xs rounded-lg font-semibold",
    lg: "px-3 py-1.5 text-sm rounded-lg font-semibold",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 border shadow-xs transition-all duration-150 ${sizeClasses[size]} ${colorClass} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75" />
      {label}
    </span>
  );
};
