import React from "react";
import { useQuery } from "@tanstack/react-query";
import { reportsApi } from "@/services/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";
import { Download, DollarSign, Percent, TrendingUp, CalendarDays } from "lucide-react";

export const ReportsDashboard: React.FC = () => {
  const today = new Date().toISOString().split("T")[0];

  const { data: dailyRevenue } = useQuery({
    queryKey: ["reports", "daily-revenue"],
    queryFn: () => reportsApi.getDailyRevenue(),
  });

  const { data: occupancy } = useQuery({
    queryKey: ["reports", "occupancy", today],
    queryFn: () => reportsApi.getOccupancy(today, today),
  });

  const handleExportCSV = () => {
    alert("Exporting financial report CSV...");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & Analytics Dashboard"
        subtitle="Financial performance, occupancy metrics, and operational audits."
        breadcrumbs={[{ label: "Reports" }, { label: "Analytics" }]}
        actions={
          <Button size="sm" variant="outline" onClick={handleExportCSV} leftIcon={<Download className="w-4 h-4" />}>
            Export Financial CSV
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Daily Room Revenue"
          value={formatCurrency(dailyRevenue?.totalRevenue || 0)}
          icon={DollarSign}
          variant="primary"
        />
        <StatCard
          title="Average Daily Rate"
          value={formatCurrency(dailyRevenue?.adr || 0)}
          icon={TrendingUp}
          variant="success"
        />
        <StatCard
          title="Occupancy Percentage"
          value={`${occupancy?.occupancyRate || 0}%`}
          icon={Percent}
          variant="purple"
        />
        <StatCard
          title="RevPAR"
          value={formatCurrency(dailyRevenue?.revpar || 0)}
          icon={CalendarDays}
          variant="info"
        />
      </div>
    </div>
  );
};
