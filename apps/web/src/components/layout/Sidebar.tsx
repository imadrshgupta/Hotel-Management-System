import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { NAVIGATION, NavItem } from "@/constants";
import { useAuthStore } from "@/store/auth.store";
import { useAppStore } from "@/store/app.store";
import {
  LayoutDashboard,
  Building2,
  CalendarDays,
  UserCheck,
  Sparkles,
  Wrench,
  UtensilsCrossed,
  Receipt,
  Package,
  PartyPopper,
  Crown,
  BarChart3,
  Settings,
  ChevronDown,
  ChevronRight,
  Hotel,
  ArrowDownToLine,
  ArrowUpFromLine,
  Users,
  Footprints,
  LayoutGrid,
  List,
  Plus,
  CalendarCheck,
  TableProperties,
  ClipboardList,
  Printer,
  ChefHat,
  CreditCard,
  FileText,
  Box,
  Warehouse,
  Truck,
  ShoppingCart,
  Menu,
} from "lucide-react";

const ICON_MAP: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard className="w-4 h-4" />,
  Building2: <Building2 className="w-4 h-4" />,
  CalendarDays: <CalendarDays className="w-4 h-4" />,
  UserCheck: <UserCheck className="w-4 h-4" />,
  Sparkles: <Sparkles className="w-4 h-4" />,
  Wrench: <Wrench className="w-4 h-4" />,
  UtensilsCrossed: <UtensilsCrossed className="w-4 h-4" />,
  Receipt: <Receipt className="w-4 h-4" />,
  Package: <Package className="w-4 h-4" />,
  PartyPopper: <PartyPopper className="w-4 h-4" />,
  Crown: <Crown className="w-4 h-4" />,
  BarChart3: <BarChart3 className="w-4 h-4" />,
  Settings: <Settings className="w-4 h-4" />,
  ArrowDownToLine: <ArrowDownToLine className="w-4 h-4" />,
  ArrowUpFromLine: <ArrowUpFromLine className="w-4 h-4" />,
  Users: <Users className="w-4 h-4" />,
  Footprints: <Footprints className="w-4 h-4" />,
  LayoutGrid: <LayoutGrid className="w-4 h-4" />,
  List: <List className="w-4 h-4" />,
  Plus: <Plus className="w-4 h-4" />,
  CalendarCheck: <CalendarCheck className="w-4 h-4" />,
  TableProperties: <TableProperties className="w-4 h-4" />,
  ClipboardList: <ClipboardList className="w-4 h-4" />,
  Printer: <Printer className="w-4 h-4" />,
  ChefHat: <ChefHat className="w-4 h-4" />,
  CreditCard: <CreditCard className="w-4 h-4" />,
  FileText: <FileText className="w-4 h-4" />,
  Box: <Box className="w-4 h-4" />,
  Warehouse: <Warehouse className="w-4 h-4" />,
  Truck: <Truck className="w-4 h-4" />,
  ShoppingCart: <ShoppingCart className="w-4 h-4" />,
};

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { hasPermission } = useAuthStore();
  const { sidebarOpen, sidebarCollapsed, setSidebarOpen } = useAppStore();
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({
    "Front Office": true,
    Reservations: true,
  });

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const isLinkActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  // Filter navigation items by user permissions if specified
  const filteredNav = NAVIGATION.filter((item) => {
    if (!item.permission) return true;
    return hasPermission(item.permission);
  });

  return (
    <>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 lg:hidden backdrop-blur-xs"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-40 h-screen bg-slate-900 text-slate-300 border-r border-slate-800 transition-all duration-300 flex flex-col ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${sidebarCollapsed ? "w-20" : "w-64"}`}
      >
        {/* Sidebar Header / Logo */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-slate-800">
          <Link to="/" className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-500/30">
              <Hotel className="w-5 h-5" />
            </div>
            {!sidebarCollapsed && (
              <div>
                <span className="font-extrabold text-base tracking-tight text-white block">
                  Grand Suite
                </span>
                <span className="text-[10px] font-semibold text-blue-400 uppercase tracking-widest block -mt-1">
                  HMS Platform
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-thin">
          {filteredNav.map((item) => {
            const hasChildren = item.children && item.children.length > 0;
            const isExpanded = expandedItems[item.label];
            const active = isLinkActive(item.path);

            return (
              <div key={item.label}>
                {hasChildren ? (
                  <div>
                    <button
                      onClick={() => toggleExpand(item.label)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        active
                          ? "bg-blue-600/10 text-blue-400"
                          : "text-slate-400 hover:bg-slate-800/80 hover:text-slate-200"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-slate-400">{ICON_MAP[item.icon]}</span>
                        {!sidebarCollapsed && <span>{item.label}</span>}
                      </div>
                      {!sidebarCollapsed && (
                        <span>
                          {isExpanded ? (
                            <ChevronDown className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5" />
                          )}
                        </span>
                      )}
                    </button>

                    {isExpanded && !sidebarCollapsed && (
                      <div className="mt-1 ml-4 pl-3 border-l border-slate-800 space-y-1">
                        {item.children?.map((child) => {
                          const childActive = location.pathname === child.path;
                          return (
                            <Link
                              key={child.path}
                              to={child.path}
                              onClick={() => setSidebarOpen(false)}
                              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                                childActive
                                  ? "bg-blue-600 text-white font-semibold shadow-md shadow-blue-500/20"
                                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
                              }`}
                            >
                              <span>{ICON_MAP[child.icon]}</span>
                              <span>{child.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      active
                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <span>{ICON_MAP[item.icon]}</span>
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </Link>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        {!sidebarCollapsed && (
          <div className="p-4 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
            <span>HMS Enterprise v2.4</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        )}
      </aside>
    </>
  );
};
