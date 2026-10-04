import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/layouts/AppLayout";
import { AuthLayout } from "@/layouts/AuthLayout";
import { ErrorLayout } from "@/layouts/ErrorLayout";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { LoadingState } from "@/components/ui/LoadingState";

// ── Lazy-loaded feature pages (code-split per route) ──────────
const lazyPage = <T,>(importer: () => Promise<{ [K in keyof T]: any }>, name: keyof T) =>
  lazy(() => importer().then((m) => ({ default: m[name] })));

// Auth
const Login = lazyPage(() => import("@/features/auth/Login"), "Login");
const ForgotPassword = lazyPage(() => import("@/features/auth/ForgotPassword"), "ForgotPassword");
const ResetPassword = lazyPage(() => import("@/features/auth/ResetPassword"), "ResetPassword");
const Unauthorized = lazyPage(() => import("@/features/auth/Unauthorized"), "Unauthorized");

// Dashboard
const Dashboard = lazyPage(() => import("@/features/dashboard/Dashboard"), "Dashboard");

// Front Office
const Arrivals = lazyPage(() => import("@/features/front-office/Arrivals"), "Arrivals");
const Departures = lazyPage(() => import("@/features/front-office/Departures"), "Departures");
const InHouse = lazyPage(() => import("@/features/front-office/InHouse"), "InHouse");
const WalkIn = lazyPage(() => import("@/features/front-office/WalkIn"), "WalkIn");
const RoomBoard = lazyPage(() => import("@/features/front-office/RoomBoard"), "RoomBoard");

// Reservations
const ReservationList = lazyPage(() => import("@/features/reservations/ReservationList"), "ReservationList");
const ReservationForm = lazyPage(() => import("@/features/reservations/ReservationForm"), "ReservationForm");
const ReservationDetail = lazyPage(() => import("@/features/reservations/ReservationDetail"), "ReservationDetail");
const AvailabilityCalendar = lazyPage(() => import("@/features/reservations/AvailabilityCalendar"), "AvailabilityCalendar");

// Guests
const GuestList = lazyPage(() => import("@/features/guests/GuestList"), "GuestList");
const GuestForm = lazyPage(() => import("@/features/guests/GuestForm"), "GuestForm");
const GuestDetail = lazyPage(() => import("@/features/guests/GuestDetail"), "GuestDetail");

// Housekeeping & Maintenance
const HousekeepingBoard = lazyPage(() => import("@/features/housekeeping/HousekeepingBoard"), "HousekeepingBoard");
const MaintenanceList = lazyPage(() => import("@/features/maintenance/MaintenanceList"), "MaintenanceList");

// POS
const PosTables = lazyPage(() => import("@/features/pos/PosTables"), "PosTables");
const PosOrders = lazyPage(() => import("@/features/pos/PosOrders"), "PosOrders");
const PosKotView = lazyPage(() => import("@/features/pos/PosKot"), "PosKotView");

// Inventory
const InventoryItems = lazyPage(() => import("@/features/inventory/InventoryItems"), "InventoryItems");
const InventoryStock = lazyPage(() => import("@/features/inventory/InventoryStock"), "InventoryStock");
const InventoryVendors = lazyPage(() => import("@/features/inventory/InventoryVendors"), "InventoryVendors");
const InventoryPurchaseOrders = lazyPage(() => import("@/features/inventory/InventoryPurchaseOrders"), "InventoryPurchaseOrders");

// Billing
const FolioPage = lazyPage(() => import("@/features/billing/FolioPage"), "FolioPage");
const PaymentsPage = lazyPage(() => import("@/features/billing/PaymentsPage"), "PaymentsPage");
const InvoicesPage = lazyPage(() => import("@/features/billing/InvoicesPage"), "InvoicesPage");

// Banquet & Loyalty
const BanquetEvents = lazyPage(() => import("@/features/banquet/BanquetEvents"), "BanquetEvents");
const LoyaltyMembers = lazyPage(() => import("@/features/loyalty/LoyaltyMembers"), "LoyaltyMembers");

// Reports & Settings
const ReportsDashboard = lazyPage(() => import("@/features/reports/ReportsDashboard"), "ReportsDashboard");
const SettingsLayout = lazyPage(() => import("@/features/settings/SettingsLayout"), "SettingsLayout");
const PropertySettings = lazyPage(() => import("@/features/settings/PropertySettings"), "PropertySettings");
const SettingsUsers = lazyPage(() => import("@/features/settings/SettingsUsers"), "SettingsUsers");
const SettingsRooms = lazyPage(() => import("@/features/settings/SettingsRooms"), "SettingsRooms");
const SettingsRoomTypes = lazyPage(() => import("@/features/settings/SettingsRoomTypes"), "SettingsRoomTypes");
const SettingsFloors = lazyPage(() => import("@/features/settings/SettingsFloors"), "SettingsFloors");
const SettingsTaxes = lazyPage(() => import("@/features/settings/SettingsTaxes"), "SettingsTaxes");

const PageFallback = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <LoadingState message="Loading module..." />
  </div>
);

export const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        {/* Public Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>

        {/* Protected App Routes */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Dashboard />} />

          {/* Front Office */}
          <Route path="/front-office/arrivals" element={<Arrivals />} />
          <Route path="/front-office/departures" element={<Departures />} />
          <Route path="/front-office/in-house" element={<InHouse />} />
          <Route path="/front-office/walk-in" element={<WalkIn />} />
          <Route path="/front-office/room-board" element={<RoomBoard />} />

          {/* Reservations */}
          <Route path="/reservations" element={<ReservationList />} />
          <Route path="/reservations/new" element={<ReservationForm />} />
          <Route path="/reservations/availability" element={<AvailabilityCalendar />} />
          <Route path="/reservations/:id" element={<ReservationDetail />} />

          {/* Guests */}
          <Route path="/guests" element={<GuestList />} />
          <Route path="/guests/new" element={<GuestForm />} />
          <Route path="/guests/:id" element={<GuestDetail />} />

          {/* Operations */}
          <Route path="/housekeeping" element={<HousekeepingBoard />} />
          <Route path="/maintenance" element={<MaintenanceList />} />

          {/* POS */}
          <Route path="/pos/tables" element={<PosTables />} />
          <Route path="/pos/orders" element={<PosOrders />} />
          <Route path="/pos/kot" element={<PosKotView />} />
          <Route path="/pos/kitchen" element={<PosKotView />} />
          <Route path="/pos" element={<Navigate to="/pos/tables" replace />} />

          {/* Billing */}
          <Route path="/billing/folio/:stayId" element={<FolioPage />} />
          <Route path="/billing/payments" element={<PaymentsPage />} />
          <Route path="/billing/invoices" element={<InvoicesPage />} />
          <Route path="/billing" element={<Navigate to="/billing/payments" replace />} />

          {/* Banquet & Loyalty */}
          <Route path="/banquet" element={<BanquetEvents />} />
          <Route path="/loyalty" element={<LoyaltyMembers />} />

          {/* Inventory */}
          <Route path="/inventory/items" element={<InventoryItems />} />
          <Route path="/inventory/stock" element={<InventoryStock />} />
          <Route path="/inventory/vendors" element={<InventoryVendors />} />
          <Route path="/inventory/purchase-orders" element={<InventoryPurchaseOrders />} />
          <Route path="/inventory" element={<Navigate to="/inventory/items" replace />} />

          {/* Reports & Settings */}
          <Route path="/reports" element={<ReportsDashboard />} />
          <Route path="/settings" element={<SettingsLayout />}>
            <Route index element={<Navigate to="/settings/property" replace />} />
            <Route path="property" element={<PropertySettings />} />
            <Route path="users" element={<SettingsUsers />} />
            <Route path="rooms" element={<SettingsRooms />} />
            <Route path="room-types" element={<SettingsRoomTypes />} />
            <Route path="floors" element={<SettingsFloors />} />
            <Route path="taxes" element={<SettingsTaxes />} />
          </Route>

          <Route path="/unauthorized" element={<Unauthorized />} />
        </Route>

        {/* 404 Route */}
        <Route path="*" element={<ErrorLayout />} />
      </Routes>
    </Suspense>
  );
};