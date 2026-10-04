import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { PageHeader } from "@/components/ui/PageHeader";
import { Building, Users, BedDouble, DoorOpen, Layers, Receipt } from "lucide-react";

export const SettingsLayout: React.FC = () => {
  const location = useLocation();

  const tabs = [
    { label: "Property Details", path: "/settings/property", icon: Building },
    { label: "Users & Staff", path: "/settings/users", icon: Users },
    { label: "Rooms", path: "/settings/rooms", icon: BedDouble },
    { label: "Room Types", path: "/settings/room-types", icon: DoorOpen },
    { label: "Floors", path: "/settings/floors", icon: Layers },
    { label: "Taxes & Policies", path: "/settings/taxes", icon: Receipt },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="System & Property Settings"
        subtitle="Configure hotel rules, staff permissions, room setup, and taxes."
        breadcrumbs={[{ label: "Settings" }]}
      />

      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6 text-sm font-semibold overflow-x-auto">
        {tabs.map((t) => {
          const active = location.pathname.startsWith(t.path);
          const Icon = t.icon;
          return (
            <Link
              key={t.path}
              to={t.path}
              className={`flex items-center gap-2 pb-3 transition-colors shrink-0 ${
                active
                  ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </Link>
          );
        })}
      </div>

      <div>
        <Outlet />
      </div>
    </div>
  );
};
