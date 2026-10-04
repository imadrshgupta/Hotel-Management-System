import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { guestsApi } from "@/services/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { User, Calendar, Heart } from "lucide-react";

export const GuestDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<"overview" | "history" | "preferences">("overview");

  const { data: guest, isLoading, isError, refetch } = useQuery({
    queryKey: ["guest", id],
    queryFn: () => (id ? guestsApi.get(id) : null),
    enabled: !!id,
  });

  if (isLoading) return <LoadingState message="Loading guest profile..." />;
  if (isError || !guest) return <ErrorState title="Guest Profile Not Found" onRetry={refetch} />;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title={`${guest.first_name} ${guest.last_name}`}
        subtitle={`VIP Status: ${guest.vip_status === "VIP" ? "Active VIP Member" : "Standard Guest"}`}
        breadcrumbs={[
          { label: "Guests", path: "/guests" },
          { label: `${guest.first_name} ${guest.last_name}` },
        ]}
      />

      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab("overview")}
          className={`pb-3 transition-colors ${
            activeTab === "overview"
              ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400"
              : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          Overview & Personal Info
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`pb-3 transition-colors ${
            activeTab === "history"
              ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400"
              : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          Stay History
        </button>
        <button
          onClick={() => setActiveTab("preferences")}
          className={`pb-3 transition-colors ${
            activeTab === "preferences"
              ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400"
              : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          Guest Preferences
        </button>
      </div>

      {activeTab === "overview" && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" />
            Contact & Identity Info
          </h3>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-500 block">Email Address</span>
              <span className="font-semibold text-slate-900 dark:text-white">{guest.email || "N/A"}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Phone Number</span>
              <span className="font-semibold text-slate-900 dark:text-white">{guest.phone || "N/A"}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Nationality</span>
              <span className="font-semibold">{guest.nationality || "Not specified"}</span>
            </div>
            <div>
              <span className="text-slate-500 block">ID Document</span>
              <span className="font-semibold">{guest.id_type || "Passport"}: {guest.id_number || "-"}</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === "history" && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3 text-xs">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            Past Stays & Bookings
          </h3>
          <p className="text-slate-500">Total Recorded Stays: {guest.total_stays || 0}</p>
        </div>
      )}

      {activeTab === "preferences" && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3 text-xs">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-500" />
            Special Preferences & Notes
          </h3>
          <p className="text-slate-500">{guest.notes || "No specific preferences recorded for this guest."}</p>
        </div>
      )}
    </div>
  );
};
