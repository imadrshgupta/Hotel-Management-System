import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { housekeepingApi } from "@/services/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { FilterBar } from "@/components/ui/FilterBar";
import { useAppStore } from "@/store/app.store";
import { useRealtimeInvalidate } from "@/hooks/useRealtimeInvalidate";
import { User } from "lucide-react";
import type { HousekeepingTask } from "@/types";

export const HousekeepingBoard: React.FC = () => {
  const queryClient = useQueryClient();
  const addToast = useAppStore((s) => s.addToast);
  const [statusFilter, setStatusFilter] = useState("");

  // Live updates: housekeeping assignments broadcast by the backend
  useRealtimeInvalidate({
    "housekeeping:assigned": [["housekeeping"]],
    "room:status_changed": [["housekeeping"]],
  });

  const { data: response, isLoading, isError, refetch } = useQuery({
    queryKey: ["housekeeping", "tasks", statusFilter],
    queryFn: () => housekeepingApi.list({ status: statusFilter }),
  });

  const startTaskMutation = useMutation({
    mutationFn: (id: string) => housekeepingApi.start(id),
    onSuccess: () => {
      addToast("Housekeeping task started", "info");
      queryClient.invalidateQueries({ queryKey: ["housekeeping"] });
    },
    onError: (err: any) => addToast(err?.response?.data?.message || "Update failed", "error"),
  });

  const completeTaskMutation = useMutation({
    mutationFn: (id: string) => housekeepingApi.complete(id),
    onSuccess: () => {
      addToast("Housekeeping task completed", "success");
      queryClient.invalidateQueries({ queryKey: ["housekeeping"] });
    },
    onError: (err: any) => addToast(err?.response?.data?.message || "Update failed", "error"),
  });

  const inspectTaskMutation = useMutation({
    mutationFn: (id: string) => housekeepingApi.inspect(id),
    onSuccess: () => {
      addToast("Room passed inspection", "success");
      queryClient.invalidateQueries({ queryKey: ["housekeeping"] });
    },
    onError: (err: any) => addToast(err?.response?.data?.message || "Update failed", "error"),
  });

  if (isLoading) return <LoadingState message="Loading housekeeping tasks..." />;
  if (isError) return <ErrorState title="Failed to load tasks" onRetry={refetch} />;

  const tasks: HousekeepingTask[] = Array.isArray(response?.data)
    ? response.data
    : Array.isArray(response)
    ? (response as any)
    : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Housekeeping Task Management"
        subtitle="Manage room cleaning tasks, inspections, and staff assignments."
        breadcrumbs={[{ label: "Housekeeping" }, { label: "Tasks" }]}
      />

      <FilterBar>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="py-2 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
        >
          <option value="">All Task Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="ASSIGNED">Assigned</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="INSPECTED">Inspected</option>
        </select>
      </FilterBar>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tasks.length === 0 ? (
          <div className="col-span-full p-8 text-center text-xs text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border">
            No housekeeping tasks scheduled.
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-base text-slate-900 dark:text-white">
                  Room {task.room?.number || "Unassigned"}
                </span>
                <StatusBadge status={task.status} type="housekeeping" size="sm" />
              </div>

              <div className="text-xs space-y-1 text-slate-500">
                <p>Task Type: <strong>{task.task_type || "CLEANING"}</strong></p>
                {task.assigned_to && (
                  <p className="flex items-center gap-1">
                    <User className="w-3 h-3 text-slate-400" />
                    Assigned: Staff ID #{task.assigned_to}
                  </p>
                )}
                {task.priority && (
                  <div className="pt-1">
                    <StatusBadge status={task.priority} type="priority" size="sm" />
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                {task.status === "PENDING" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => startTaskMutation.mutate(task.id)}
                  >
                    Start Cleaning
                  </Button>
                )}
                {task.status === "IN_PROGRESS" && (
                  <Button
                    size="sm"
                    variant="success"
                    onClick={() => completeTaskMutation.mutate(task.id)}
                  >
                    Mark Completed
                  </Button>
                )}
                {task.status === "COMPLETED" && (
                  <Button
                    size="sm"
                    onClick={() => inspectTaskMutation.mutate(task.id)}
                  >
                    Pass Inspection
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
