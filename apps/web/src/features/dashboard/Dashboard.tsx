import React from "react";
import { useQuery } from "@tanstack/react-query";
import { reportsApi, roomsApi } from "@/services/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Button } from "@/components/ui/Button";
import { Link } from "react-router-dom";
import { useRealtimeInvalidate } from "@/hooks/useRealtimeInvalidate";
import {
  Percent,
  DollarSign,
  TrendingUp,
  ArrowDownToLine,
  ArrowUpFromLine,
  Users,
  BedDouble,
  Sparkles,
  Wrench,
  CalendarDays,
  Plus,
  ChevronRight,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export const Dashboard: React.FC = () => {
  // Live updates: room/check-in/check-out events refresh KPIs without reload
  useRealtimeInvalidate({
    "room:status_changed": [["rooms"], ["reports"]],
    "stay:checked_in": [["rooms"], ["reports"]],
    "stay:checked_out": [["rooms"], ["reports"]],
    "payment:created": [["reports"]],
    "reservation:created": [["reports"]],
    "reservation:confirmed": [["reports"]],
  });

  const {
    data: roomStatusSummary,
    isLoading: isLoadingSummary,
    isError: isErrorSummary,
    refetch: refetchSummary,
  } = useQuery({
    queryKey: ["rooms", "status-summary"],
    queryFn: () => roomsApi.getStatusSummary(),
    refetchInterval: 30000,
  });

  const { data: arrivalsData } = useQuery({
    queryKey: ["reports", "arrivals"],
    queryFn: () => reportsApi.getArrivals(),
  });

  const { data: departuresData } = useQuery({
    queryKey: ["reports", "departures"],
    queryFn: () => reportsApi.getDepartures(),
  });

  const { data: dailyRevenue } = useQuery({
    queryKey: ["reports", "daily-revenue"],
    queryFn: () => reportsApi.getDailyRevenue(),
  });

  if (isLoadingSummary) {
    return <LoadingState message="Loading dashboard statistics..." />;
  }

  if (isErrorSummary) {
    return <ErrorState title="Failed to load dashboard" onRetry={refetchSummary} />;
  }

  const summary = roomStatusSummary || {
    TOTAL: 0,
    VACANT_CLEAN: 0,
    VACANT_DIRTY: 0,
    OCCUPIED: 0,
    RESERVED: 0,
    DIRTY: 0,
    CLEANING: 0,
    INSPECTION: 0,
    MAINTENANCE: 0,
    OUT_OF_ORDER: 0,
  };

  const occupancyRate = summary.TOTAL > 0 ? (summary.OCCUPIED / summary.TOTAL) * 100 : 0;
  const arrivalsList = arrivalsData?.guests || arrivalsData || [];
  const departuresList = departuresData?.guests || departuresData || [];
  const todayRevenue = dailyRevenue?.totalRevenue || 0;
  const adr = dailyRevenue?.adr || (summary.OCCUPIED > 0 ? todayRevenue / summary.OCCUPIED : 0);
  const revpar = summary.TOTAL > 0 ? todayRevenue / summary.TOTAL : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hotel Operations Dashboard"
        subtitle={`Real-time property overview for ${formatDate(new Date())}`}
        actions={
          <div className="flex items-center gap-2">
            <Link to="/front-office/walk-in">
              <Button size="sm" variant="outline" leftIcon={<Users className="w-4 h-4" />}>
                Walk-in
              </Button>
            </Link>
            <Link to="/reservations/new">
              <Button size="sm" leftIcon={<Plus className="w-4 h-4" />}>
                New Reservation
              </Button>
            </Link>
          </div>
        }
      />

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Occupancy Rate"
          value={`${Math.round(occupancyRate)}%`}
          subtitle={`${summary.OCCUPIED} of ${summary.TOTAL} rooms occupied`}
          icon={Percent}
          variant="primary"
          trend={{ value: 4.2, isPositive: true }}
        />
        <StatCard
          title="Average Daily Rate (ADR)"
          value={formatCurrency(adr)}
          subtitle="Average revenue per occupied room"
          icon={DollarSign}
          variant="success"
          trend={{ value: 2.1, isPositive: true }}
        />
        <StatCard
          title="RevPAR"
          value={formatCurrency(revpar)}
          subtitle="Revenue per available room"
          icon={TrendingUp}
          variant="purple"
          trend={{ value: 5.8, isPositive: true }}
        />
        <StatCard
          title="Today's Revenue"
          value={formatCurrency(todayRevenue)}
          subtitle="Room charges + POS total"
          icon={CalendarDays}
          variant="info"
        />
      </div>

      {/* Quick Status Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Link to="/front-office/arrivals">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-blue-500 transition-all">
            <div className="flex items-center justify-between text-blue-600 dark:text-blue-400 mb-2">
              <ArrowDownToLine className="w-5 h-5" />
              <span className="text-xl font-bold">{arrivalsList.length}</span>
            </div>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Arrivals</p>
          </div>
        </Link>

        <Link to="/front-office/departures">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-amber-500 transition-all">
            <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 mb-2">
              <ArrowUpFromLine className="w-5 h-5" />
              <span className="text-xl font-bold">{departuresList.length}</span>
            </div>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Departures</p>
          </div>
        </Link>

        <Link to="/front-office/in-house">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-emerald-500 transition-all">
            <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 mb-2">
              <Users className="w-5 h-5" />
              <span className="text-xl font-bold">{summary.OCCUPIED}</span>
            </div>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">In-house</p>
          </div>
        </Link>

        <Link to="/front-office/room-board">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-cyan-500 transition-all">
            <div className="flex items-center justify-between text-cyan-600 dark:text-cyan-400 mb-2">
              <BedDouble className="w-5 h-5" />
              <span className="text-xl font-bold">{summary.VACANT_CLEAN}</span>
            </div>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Available Clean</p>
          </div>
        </Link>

        <Link to="/housekeeping">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-orange-500 transition-all">
            <div className="flex items-center justify-between text-orange-600 dark:text-orange-400 mb-2">
              <Sparkles className="w-5 h-5" />
              <span className="text-xl font-bold">{summary.DIRTY + summary.VACANT_DIRTY}</span>
            </div>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Dirty Rooms</p>
          </div>
        </Link>

        <Link to="/maintenance">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-rose-500 transition-all">
            <div className="flex items-center justify-between text-rose-600 dark:text-rose-400 mb-2">
              <Wrench className="w-5 h-5" />
              <span className="text-xl font-bold">{summary.MAINTENANCE + summary.OUT_OF_ORDER}</span>
            </div>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Maintenance</p>
          </div>
        </Link>
      </div>

      {/* Operational Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Arrivals */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <ArrowDownToLine className="w-4 h-4 text-blue-600" />
              Today's Expected Arrivals ({arrivalsList.length})
            </h3>
            <Link
              to="/front-office/arrivals"
              className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
            >
              View All <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto">
            {arrivalsList.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No expected arrivals for today.</p>
            ) : (
              arrivalsList.slice(0, 5).map((stay: any, idx: number) => (
                <div
                  key={stay.id || idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800/80 text-xs"
                >
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">
                      {stay.guest?.first_name} {stay.guest?.last_name || stay.guest_name || "Guest"}
                    </p>
                    <p className="text-slate-500">
                      Room: {stay.room?.number || stay.room_number || "Unassigned"} • {stay.adults || 1} Guests
                    </p>
                  </div>
                  <Link to="/front-office/arrivals">
                    <Button size="sm" variant="outline" className="text-xs py-1 px-2.5">
                      Check In
                    </Button>
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Today's Departures */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <ArrowUpFromLine className="w-4 h-4 text-amber-600" />
              Today's Expected Departures ({departuresList.length})
            </h3>
            <Link
              to="/front-office/departures"
              className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
            >
              View All <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto">
            {departuresList.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No expected departures for today.</p>
            ) : (
              departuresList.slice(0, 5).map((stay: any, idx: number) => (
                <div
                  key={stay.id || idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800/80 text-xs"
                >
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">
                      {stay.guest?.first_name} {stay.guest?.last_name || stay.guest_name || "Guest"}
                    </p>
                    <p className="text-slate-500">
                      Room {stay.room?.number || stay.room_number || "-"} • Folio Balance: {formatCurrency(stay.folio?.balance || 0)}
                    </p>
                  </div>
                  <Link to="/front-office/departures">
                    <Button size="sm" variant="outline" className="text-xs py-1 px-2.5">
                      Checkout
                    </Button>
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
