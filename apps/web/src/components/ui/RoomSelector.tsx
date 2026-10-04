import React from "react";
import { useQuery } from "@tanstack/react-query";
import { roomsApi } from "@/services/api";
import { StatusBadge } from "./StatusBadge";
import type { Room } from "@/types";

interface RoomSelectorProps {
  selectedRoomId?: string;
  roomTypeId?: string;
  onSelect: (room: Room) => void;
  statusFilter?: string;
}

export const RoomSelector: React.FC<RoomSelectorProps> = ({
  selectedRoomId,
  roomTypeId,
  onSelect,
  statusFilter,
}) => {
  const { data: response, isLoading } = useQuery({
    queryKey: ["rooms", "selector", roomTypeId, statusFilter],
    queryFn: () =>
      roomsApi.list({
        limit: 100,
      }),
  });

  const allRooms = response?.data || [];
  const filteredRooms = allRooms.filter((r) => {
    if (roomTypeId && r.room_type_id !== roomTypeId) return false;
    if (statusFilter && r.status !== statusFilter) return false;
    return true;
  });

  if (isLoading) {
    return <p className="text-xs text-slate-500 py-2">Loading available rooms...</p>;
  }

  if (filteredRooms.length === 0) {
    return (
      <div className="p-3 text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-center border border-slate-200 dark:border-slate-800">
        No rooms available for the selected criteria.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1">
      {filteredRooms.map((room) => {
        const isSelected = room.id === selectedRoomId;
        return (
          <button
            key={room.id}
            type="button"
            onClick={() => onSelect(room)}
            className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition-all ${
              isSelected
                ? "border-blue-600 bg-blue-50/80 dark:bg-blue-950/50 ring-2 ring-blue-500/20"
                : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="font-bold text-sm text-slate-900 dark:text-white">
                Room {room.number}
              </span>
              <StatusBadge status={room.status} type="room" size="sm" />
            </div>
            <span className="text-[11px] text-slate-500 mt-1 truncate w-full">
              {room.roomType?.name || "Standard Room"}
            </span>
          </button>
        );
      })}
    </div>
  );
};
