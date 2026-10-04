import React from "react";
import { Pagination } from "@/components/ui/Pagination";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";

export interface Column<T> {
  header: string;
  accessorKey?: keyof T | string;
  cell?: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  isError?: boolean;
  error?: string;
  emptyTitle?: string;
  emptyMessage?: string;
  pagination?: {
    page: number;
    totalPages: number;
    total: number;
    limit: number;
    onPageChange: (page: number) => void;
    onLimitChange?: (limit: number) => void;
  };
  onRowClick?: (row: T) => void;
  className?: string;
}

export function DataTable<T extends { id?: string | number }>({
  columns,
  data,
  isLoading = false,
  isError = false,
  error = "Failed to load data",
  emptyTitle = "No results found",
  emptyMessage = "There are no records matching your criteria.",
  pagination,
  onRowClick,
  className = "",
}: DataTableProps<T>) {
  if (isLoading) {
    return <LoadingState message="Loading data..." />;
  }

  if (isError) {
    return <ErrorState message={error} />;
  }

  return (
    <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
          <thead className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className={`px-4 py-3.5 ${col.className || ""}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-8">
                  <EmptyState title={emptyTitle} message={emptyMessage} />
                </td>
              </tr>
            ) : (
              data.map((row, rowIdx) => (
                <tr
                  key={row.id || rowIdx}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`transition-colors duration-150 ${
                    onRowClick ? "hover:bg-slate-50/80 dark:hover:bg-slate-800/50 cursor-pointer" : "hover:bg-slate-50/40 dark:hover:bg-slate-800/30"
                  }`}
                >
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className={`px-4 py-3.5 ${col.className || ""}`}>
                      {col.cell
                        ? col.cell(row)
                        : col.accessorKey
                        ? String((row as any)[col.accessorKey] ?? "")
                        : null}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && pagination.total > 0 && (
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          limit={pagination.limit}
          onPageChange={pagination.onPageChange}
          onLimitChange={pagination.onLimitChange}
        />
      )}
    </div>
  );
}
