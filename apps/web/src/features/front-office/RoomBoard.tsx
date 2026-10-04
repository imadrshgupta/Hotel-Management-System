import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { roomsApi, floorsApi } from "@/services/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { FilterBar } from "@/components/ui/FilterBar";
import { Modal } from "@/components/ui/Modal";
import { useAppStore } from "@/store/app.store";
import { useRealtimeInvalidate } from "@/hooks/useRealtimeInvalidate";
import { LayoutGrid, Sparkles, Wrench, RefreshCw, Key, Check } from "lucide-react";
import type { Room, RoomStatus } from "@/types";

export const RoomBoard: React.FC = () => {
  const queryClient = useQueryClient();
  const addToast = useAppStore((s) => s.addToast);

  // Live updates: room status changes and reservation events refresh the board
  useRealtimeInvalidate({
    "room:status_changed": [["rooms"]],
    "reservation:created": [["rooms"]],
    "reservation:confirmed": [["rooms"]],
    "reservation:cancelled": [["rooms"]],
    "stay:checked_in": [["rooms"]],
    "stay:checked_out": [["rooms"]],
  });
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [search, setSearch] = useState("");
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const { data: roomsData, isLoading, isError, refetch } = useQuery({
    queryKey: ["rooms", "list"],
    queryFn: () => roomsApi.list({ limit: 200 }),
    refetchInterval: 15000,
  });

  const { data: floors } = useQuery({
    queryKey: ["floors"],
    queryFn: () => floorsApi.list(),
  });

  const changeStatusMutation = useMutation({
    mutationFn: (data: { id: string; status: RoomStatus }) =>
      roomsApi.changeStatus(data.id, data.status),
    onSuccess: () => {
      addToast("Room status updated successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      setSelectedRoom(null);
    },
    onError: (err: any) => {
      addToast(err?.response?.data?.message || "Status change failed", "error");
    },
  });

  if (isLoading) return <LoadingState message="Loading room board matrix..." />;
  if (isError) return <ErrorState title="Failed to load room board" onRetry={refetch} />;

  const roomsList = roomsData?.data || [];
  const filteredRooms = roomsList.filter((r) => {
    if (statusFilter && r.status !== statusFilter) return false;
    if (search && !r.number.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Group rooms by floor
  const floorMap: Record<string, Room[]> = {};
  filteredRooms.forEach((r) => {
    const floorKey = r.floor?.name || `Level ${r.floor_id || 1}`;
    if (!floorMap[floorKey]) floorMap[floorKey] = [];
    floorMap[floorKey].push(r);
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Interactive Room Board"
        subtitle="Real-time room occupancy & housekeeping status matrix."
        breadcrumbs={[{ label: "Front Office" }, { label: "Room Board" }]}
        actions={
          <Button
            size="sm"
            variant="outline"
            onClick={() => refetch()}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh Board
          </Button>
        }
      />

      {/* Filter Bar */}
      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search room #..."
      >
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="py-2 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
        >
          <option value="">All Statuses</option>
          <option value="VACANT_CLEAN">Vacant Clean</option>
          <option value="VACANT_DIRTY">Vacant Dirty</option>
          <option value="OCCUPIED">Occupied</option>
          <option value="MAINTENANCE">Maintenance</option>
          <option value="OUT_OF_ORDER">Out of Order</option>
        </select>
      </FilterBar>

      {/* Room Board Floors */}
      <div className="space-y-6">
        {Object.keys(floorMap).length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border">
            No rooms match your filters.
          </div>
        ) : (
          Object.entries(floorMap).map(([floorName, floorRooms]) => (
            <div key={floorName} className="space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-blue-600" />
                {floorName} ({floorRooms.length} rooms)
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {floorRooms.map((room) => (
                  <div
                    key={room.id}
                    onClick={() => setSelectedRoom(room)}
                    className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-blue-500 cursor-pointer transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-base font-extrabold text-slate-900 dark:text-white">
                        {room.number}
                      </span>
                      <StatusBadge status={room.status} type="room" size="sm" />
                    </div>

                    <p className="text-[11px] font-medium text-slate-500 mt-2 truncate">
                      {room.roomType?.name || "Standard Room"}
                    </p>

                    <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                      <span>Rate: ${room.rate_override || room.roomType?.base_rate || 100}</span>
                      {room.is_smoking && <span>🚬 Smoking</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quick Status Update Modal */}
      {selectedRoom && (
        <Modal
          isOpen={!!selectedRoom}
          onClose={() => setSelectedRoom(null)}
          title={`Room ${selectedRoom.number} Quick Actions`}
          size="sm"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900 dark:text-white">
                  Room {selectedRoom.number} — {selectedRoom.roomType?.name}
                </p>
                <p className="text-slate-500">Current Status: {selectedRoom.status}</p>
              </div>
              <StatusBadge status={selectedRoom.status} type="room" size="sm" />
            </div>

            <div className="space-y-2 pt-2">
              <p className="font-semibold text-slate-700 dark:text-slate-300">
                Update Status to:
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    changeStatusMutation.mutate({ id: selectedRoom.id, status: "VACANT_CLEAN" })
                  }
                  leftIcon={<Check className="w-3.5 h-3.5 text-emerald-600" />}
                >
                  Mark Clean
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    changeStatusMutation.mutate({ id: selectedRoom.id, status: "VACANT_DIRTY" })
                  }
                  leftIcon={<Sparkles className="w-3.5 h-3.5 text-orange-600" />}
                >
                  Mark Dirty
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    changeStatusMutation.mutate({ id: selectedRoom.id, status: "MAINTENANCE" })
                  }
                  leftIcon={<Wrench className="w-3.5 h-3.5 text-rose-600" />}
                >
                  Maintenance
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    changeStatusMutation.mutate({ id: selectedRoom.id, status: "OUT_OF_ORDER" })
                  }
                >
                  Out of Order
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
