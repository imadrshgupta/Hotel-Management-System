import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { availabilityApi } from "@/services/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { useRealtimeInvalidate } from "@/hooks/useRealtimeInvalidate";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import type { RoomAvailability } from "@/types";

type CellState = "AVAILABLE" | "RESERVED" | "OCCUPIED" | "MAINTENANCE";

function toDateKey(d: Date): string {
  return d.toISOString().split("T")[0];
}

function addDays(d: Date, days: number): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + days);
  return copy;
}

// Half-open interval: a booking occupies date d when check_in <= d < check_out
function overlaps(checkIn: string, checkOut: string, dateKey: string): boolean {
  return checkIn <= dateKey && dateKey < checkOut;
}

export const AvailabilityCalendar: React.FC = () => {
  const [start, setStart] = useState<Date>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });
  const [end, setEnd] = useState<Date>(() => addDays(new Date(), 13));

  // Live updates: reservation lifecycle events refresh the matrix
  useRealtimeInvalidate({
    "reservation:created": [["availability"]],
    "reservation:confirmed": [["availability"]],
    "reservation:cancelled": [["availability"]],
    "reservation:no_show": [["availability"]],
    "stay:checked_in": [["availability"]],
    "stay:checked_out": [["availability"]],
  });

  const { data: rooms, isLoading, isError, refetch } = useQuery({
    queryKey: ["availability", toDateKey(start), toDateKey(end)],
    queryFn: () =>
      availabilityApi.getRoomAvailability({
        start_date: toDateKey(start),
        end_date: toDateKey(end),
      }),
  });

  const dateList = useMemo(() => {
    const list: string[] = [];
    let curr = new Date(start);
    while (curr <= end) {
      list.push(toDateKey(curr));
      curr = addDays(curr, 1);
    }
    return list;
  }, [start, end]);

  const shiftWindow = (days: number) => {
    setStart(addDays(start, days));
    setEnd(addDays(end, days));
  };

  const goToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    setStart(today);
    setEnd(addDays(today, 13));
  };

  if (isLoading) return <LoadingState message="Calculating availability matrix..." />;
  if (isError) return <ErrorState title="Failed to load calendar" onRetry={refetch} />;

  const roomList: RoomAvailability[] = rooms || [];

  const cellState = (room: RoomAvailability, dateKey: string): CellState => {
    if (
      room.status === "OUT_OF_ORDER" ||
      room.status === "MAINTENANCE"
    ) {
      return "MAINTENANCE";
    }
    const stay = room.stays?.find(
      (s) => overlaps(s.check_in_date, s.check_out_date, dateKey)
    );
    if (stay) return "OCCUPIED";
    const reservation = room.reservations?.find(
      (r) => overlaps(r.check_in_date, r.check_out_date, dateKey)
    );
    if (reservation) return "RESERVED";
    return "AVAILABLE";
  };

  const cellStyles: Record<CellState, string> = {
    AVAILABLE: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
    RESERVED: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300",
    OCCUPIED: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
    MAINTENANCE: "bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-500",
  };

  const cellLabels: Record<CellState, string> = {
    AVAILABLE: "Available",
    RESERVED: "Reserved",
    OCCUPIED: "Occupied",
    MAINTENANCE: "Out of Order",
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Room Availability Calendar"
        subtitle="Per-room occupancy matrix — data comes live from the availability API."
        breadcrumbs={[
          { label: "Reservations", path: "/reservations" },
          { label: "Availability Calendar" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => shiftWindow(-14)}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={goToday} leftIcon={<CalendarDays className="w-4 h-4" />}>
              Today
            </Button>
            <Button size="sm" variant="outline" onClick={() => shiftWindow(14)}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        }
      />

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-emerald-200 dark:bg-emerald-800" /> Available
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-purple-200 dark:bg-purple-800" /> Reserved
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-blue-200 dark:bg-blue-800" /> Occupied
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-slate-300 dark:bg-slate-700" /> Out of Order
        </span>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden p-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <th className="p-3 font-bold min-w-40 sticky left-0 bg-slate-50 dark:bg-slate-800 z-10">
                  Room
                </th>
                {dateList.map((d) => (
                  <th key={d} className="p-2 text-center font-semibold min-w-12">
                    <div>{new Date(d).toLocaleDateString("en-US", { weekday: "short" })}</div>
                    <div className="text-[10px] text-slate-500">{new Date(d).getDate()}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {roomList.length === 0 ? (
                <tr>
                  <td colSpan={dateList.length + 1} className="p-8 text-center text-slate-500">
                    No rooms available for this property.
                  </td>
                </tr>
              ) : (
                roomList.map((room) => (
                  <tr key={room.room_id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="p-3 font-semibold text-slate-900 dark:text-white sticky left-0 bg-white dark:bg-slate-900 shadow-xs z-10">
                      <div>{room.room_number}</div>
                      <div className="text-[10px] text-slate-500 font-normal">
                        {room.room_type?.name || "Room"}
                      </div>
                    </td>
                    {dateList.map((d) => {
                      const state = cellState(room, d);
                      return (
                        <td key={d} className="p-1.5 text-center">
                          <span
                            title={`${room.room_number} — ${cellLabels[state]} (${d})`}
                            className={`inline-block w-full py-1.5 rounded-md font-bold text-[10px] ${cellStyles[state]}`}
                          >
                            {state === "AVAILABLE" ? "●" : state === "MAINTENANCE" ? "✕" : "▮"}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};