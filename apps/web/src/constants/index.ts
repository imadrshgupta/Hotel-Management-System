// ─── Routes ──────────────────────────────────────────────────
export const ROUTES = {
  LOGIN: "/login",
  LOGOUT: "/logout",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  UNAUTHORIZED: "/unauthorized",

  DASHBOARD: "/",

  // Front Office
  FRONT_OFFICE: "/front-office",
  ARRIVALS: "/front-office/arrivals",
  DEPARTURES: "/front-office/departures",
  IN_HOUSE: "/front-office/in-house",
  WALK_IN: "/front-office/walk-in",
  ROOM_BOARD: "/front-office/room-board",

  // Reservations
  RESERVATIONS: "/reservations",
  RESERVATION_NEW: "/reservations/new",
  RESERVATION_DETAIL: "/reservations/:id",
  AVAILABILITY: "/reservations/availability",

  // Guests
  GUESTS: "/guests",
  GUEST_NEW: "/guests/new",
  GUEST_DETAIL: "/guests/:id",

  // Housekeeping
  HOUSEKEEPING: "/housekeeping",

  // Maintenance
  MAINTENANCE: "/maintenance",

  // POS
  POS: "/pos",
  POS_TABLES: "/pos/tables",
  POS_ORDERS: "/pos/orders",
  POS_KOT: "/pos/kot",
  POS_KITCHEN: "/pos/kitchen",

  // Billing
  BILLING: "/billing",
  FOLIO: "/billing/folio/:stayId",
  PAYMENTS: "/billing/payments",
  INVOICES: "/billing/invoices",

  // Inventory
  INVENTORY_ITEMS: "/inventory/items",
  INVENTORY_STOCK: "/inventory/stock",
  INVENTORY_VENDORS: "/inventory/vendors",
  INVENTORY_PURCHASE_ORDERS: "/inventory/purchase-orders",
  INVENTORY_GOODS_RECEIPTS: "/inventory/goods-receipts",

  // Banquet
  BANQUET: "/banquet",

  // Loyalty
  LOYALTY: "/loyalty",

  // Reports
  REPORTS: "/reports",
  REPORT_OCCUPANCY: "/reports/occupancy",
  REPORT_REVENUE: "/reports/revenue",
  REPORT_PAYMENTS: "/reports/payments",
  REPORT_OUTSTANDING: "/reports/outstanding",

  // Settings
  SETTINGS: "/settings",
  SETTINGS_PROPERTY: "/settings/property",
  SETTINGS_USERS: "/settings/users",
  SETTINGS_ROLES: "/settings/roles",
  SETTINGS_ROOMS: "/settings/rooms",
  SETTINGS_ROOM_TYPES: "/settings/room-types",
  SETTINGS_TAXES: "/settings/taxes",
  SETTINGS_DISCOUNTS: "/settings/discounts",
  SETTINGS_PAYMENT_METHODS: "/settings/payment-methods",
  SETTINGS_RATE_PLANS: "/settings/rate-plans",
  SETTINGS_POLICIES: "/settings/policies",
  SETTINGS_SYSTEM: "/settings/system",
} as const;

// ─── Navigation ──────────────────────────────────────────────
export interface NavItem {
  label: string;
  icon: string;
  path: string;
  permission?: string;
  children?: NavItem[];
}

export const NAVIGATION: NavItem[] = [
  {
    label: "Dashboard",
    icon: "LayoutDashboard",
    path: ROUTES.DASHBOARD,
  },
  {
    label: "Front Office",
    icon: "Building2",
    path: ROUTES.FRONT_OFFICE,
    permission: "checkin.view",
    children: [
      { label: "Arrivals", icon: "ArrowDownToLine", path: ROUTES.ARRIVALS },
      { label: "Departures", icon: "ArrowUpFromLine", path: ROUTES.DEPARTURES },
      { label: "In-house", icon: "Users", path: ROUTES.IN_HOUSE },
      { label: "Walk-in", icon: "Footprints", path: ROUTES.WALK_IN },
      { label: "Room Board", icon: "LayoutGrid", path: ROUTES.ROOM_BOARD },
    ],
  },
  {
    label: "Reservations",
    icon: "CalendarDays",
    path: ROUTES.RESERVATIONS,
    permission: "reservation.view",
    children: [
      { label: "All Reservations", icon: "List", path: ROUTES.RESERVATIONS },
      { label: "New Reservation", icon: "Plus", path: ROUTES.RESERVATION_NEW, permission: "reservation.create" },
      { label: "Availability", icon: "CalendarCheck", path: ROUTES.AVAILABILITY },
    ],
  },
  {
    label: "Guests",
    icon: "UserCheck",
    path: ROUTES.GUESTS,
    permission: "guest.view",
  },
  {
    label: "Housekeeping",
    icon: "Sparkles",
    path: ROUTES.HOUSEKEEPING,
    permission: "housekeeping.view",
  },
  {
    label: "Maintenance",
    icon: "Wrench",
    path: ROUTES.MAINTENANCE,
    permission: "maintenance.view",
  },
  {
    label: "POS",
    icon: "UtensilsCrossed",
    path: ROUTES.POS,
    permission: "pos.view",
    children: [
      { label: "Tables", icon: "TableProperties", path: ROUTES.POS_TABLES },
      { label: "Orders", icon: "ClipboardList", path: ROUTES.POS_ORDERS },
      { label: "KOT", icon: "Printer", path: ROUTES.POS_KOT },
      { label: "Kitchen", icon: "ChefHat", path: ROUTES.POS_KITCHEN },
    ],
  },
  {
    label: "Billing",
    icon: "Receipt",
    path: ROUTES.BILLING,
    permission: "billing.view",
    children: [
      { label: "Payments", icon: "CreditCard", path: ROUTES.PAYMENTS },
      { label: "Invoices", icon: "FileText", path: ROUTES.INVOICES },
    ],
  },
  {
    label: "Inventory",
    icon: "Package",
    path: ROUTES.INVENTORY_ITEMS,
    permission: "inventory.view",
    children: [
      { label: "Items", icon: "Box", path: ROUTES.INVENTORY_ITEMS },
      { label: "Stock", icon: "Warehouse", path: ROUTES.INVENTORY_STOCK },
      { label: "Vendors", icon: "Truck", path: ROUTES.INVENTORY_VENDORS },
      { label: "Purchase Orders", icon: "ShoppingCart", path: ROUTES.INVENTORY_PURCHASE_ORDERS },
    ],
  },
  {
    label: "Banquet",
    icon: "PartyPopper",
    path: ROUTES.BANQUET,
    permission: "banquet.view",
  },
  {
    label: "Loyalty",
    icon: "Crown",
    path: ROUTES.LOYALTY,
    permission: "loyalty.view",
  },
  {
    label: "Reports",
    icon: "BarChart3",
    path: ROUTES.REPORTS,
    permission: "report.view",
  },
  {
    label: "Settings",
    icon: "Settings",
    path: ROUTES.SETTINGS,
    permission: "settings.view",
  },
];

// ─── Room Statuses ───────────────────────────────────────────
export const ROOM_STATUS_LABELS: Record<string, string> = {
  VACANT_CLEAN: "Vacant Clean",
  VACANT_DIRTY: "Vacant Dirty",
  OCCUPIED: "Occupied",
  RESERVED: "Reserved",
  DIRTY: "Dirty",
  CLEANING: "Cleaning",
  INSPECTION: "Inspection",
  MAINTENANCE: "Maintenance",
  OUT_OF_ORDER: "Out of Order",
};

export const ROOM_STATUS_COLORS: Record<string, string> = {
  VACANT_CLEAN: "bg-emerald-100 text-emerald-800",
  VACANT_DIRTY: "bg-yellow-100 text-yellow-800",
  OCCUPIED: "bg-blue-100 text-blue-800",
  RESERVED: "bg-purple-100 text-purple-800",
  DIRTY: "bg-orange-100 text-orange-800",
  CLEANING: "bg-cyan-100 text-cyan-800",
  INSPECTION: "bg-indigo-100 text-indigo-800",
  MAINTENANCE: "bg-red-100 text-red-800",
  OUT_OF_ORDER: "bg-gray-100 text-gray-800",
};

// ─── Reservation Statuses ────────────────────────────────────
export const RESERVATION_STATUS_LABELS: Record<string, string> = {
  INQUIRY: "Inquiry",
  CONFIRMED: "Confirmed",
  CHECKED_IN: "Checked In",
  CHECKED_OUT: "Checked Out",
  CANCELLED: "Cancelled",
  NO_SHOW: "No Show",
};

export const RESERVATION_STATUS_COLORS: Record<string, string> = {
  INQUIRY: "bg-gray-100 text-gray-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  CHECKED_IN: "bg-emerald-100 text-emerald-800",
  CHECKED_OUT: "bg-slate-100 text-slate-800",
  CANCELLED: "bg-red-100 text-red-800",
  NO_SHOW: "bg-orange-100 text-orange-800",
};

// ─── Housekeeping Statuses ───────────────────────────────────
export const HOUSEKEEPING_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  ASSIGNED: "Assigned",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  INSPECTED: "Inspected",
};

export const HOUSEKEEPING_STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-gray-100 text-gray-800",
  ASSIGNED: "bg-blue-100 text-blue-800",
  IN_PROGRESS: "bg-yellow-100 text-yellow-800",
  COMPLETED: "bg-emerald-100 text-emerald-800",
  INSPECTED: "bg-purple-100 text-purple-800",
};

// ─── Priority Labels ─────────────────────────────────────────
export const PRIORITY_LABELS: Record<string, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};

export const PRIORITY_COLORS: Record<string, string> = {
  LOW: "bg-slate-100 text-slate-700",
  MEDIUM: "bg-blue-100 text-blue-700",
  HIGH: "bg-orange-100 text-orange-700",
  URGENT: "bg-red-100 text-red-700",
};

// ─── Order Statuses ──────────────────────────────────────────
export const ORDER_STATUS_LABELS: Record<string, string> = {
  PLACED: "Placed",
  CONFIRMED: "Confirmed",
  PREPARING: "Preparing",
  READY: "Ready",
  SERVED: "Served",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const ORDER_STATUS_COLORS: Record<string, string> = {
  PLACED: "bg-gray-100 text-gray-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PREPARING: "bg-yellow-100 text-yellow-800",
  READY: "bg-emerald-100 text-emerald-800",
  SERVED: "bg-purple-100 text-purple-800",
  COMPLETED: "bg-slate-100 text-slate-800",
  CANCELLED: "bg-red-100 text-red-800",
};

// ─── KOT Statuses ────────────────────────────────────────────
export const KOT_STATUS_LABELS: Record<string, string> = {
  PRINTED: "New",
  PREPARING: "Preparing",
  READY: "Ready",
  SERVED: "Served",
  CANCELLED: "Cancelled",
};

export const KOT_STATUS_COLORS: Record<string, string> = {
  PRINTED: "bg-gray-100 text-gray-800",
  PREPARING: "bg-yellow-100 text-yellow-800",
  READY: "bg-emerald-100 text-emerald-800",
  SERVED: "bg-purple-100 text-purple-800",
  CANCELLED: "bg-red-100 text-red-800",
};

// ─── Payment Methods ─────────────────────────────────────────
export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CASH: "Cash",
  CARD: "Card",
  UPI: "UPI",
  BANK_TRANSFER: "Bank Transfer",
  OTHER: "Other",
};

export const PAYMENT_METHODS = Object.keys(PAYMENT_METHOD_LABELS);

// ─── Payment Statuses ────────────────────────────────────────
export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  COMPLETED: "Completed",
  PENDING: "Pending",
  FAILED: "Failed",
  REFUNDED: "Refunded",
  PARTIALLY_REFUNDED: "Partially Refunded",
};

export const PAYMENT_STATUS_COLORS: Record<string, string> = {
  COMPLETED: "bg-emerald-100 text-emerald-800",
  PENDING: "bg-amber-100 text-amber-800",
  FAILED: "bg-red-100 text-red-800",
  REFUNDED: "bg-slate-100 text-slate-800",
  PARTIALLY_REFUNDED: "bg-orange-100 text-orange-800",
};

// ─── Folio Item Categories ────────────────────────────────────
export const FOLIO_CATEGORIES: string[] = [
  "ROOM_CHARGE",
  "POS",
  "MINIBAR",
  "LAUNDRY",
  "SPA",
  "RESTAURANT",
  "TRANSPORT",
  "BANQUET",
  "OTHER",
];

export const FOLIO_CATEGORY_LABELS: Record<string, string> = {
  ROOM_CHARGE: "Room Charge",
  POS: "POS / Restaurant",
  MINIBAR: "Minibar",
  LAUNDRY: "Laundry",
  SPA: "Spa",
  RESTAURANT: "Restaurant",
  TRANSPORT: "Transport",
  BANQUET: "Banquet",
  OTHER: "Other",
};

// ─── Booking Sources ─────────────────────────────────────────
export const BOOKING_SOURCES: string[] = [
  "DIRECT",
  "WEBSITE",
  "PHONE",
  "WALK_IN",
  "OTA",
  "TRAVEL_AGENT",
  "CORPORATE",
  "GROUP",
  "REPEAT",
];

// ─── Stay Statuses ───────────────────────────────────────────
export const STAY_STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Active",
  CHECKED_OUT: "Checked Out",
  CANCELLED: "Cancelled",
};

export const STAY_STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-800",
  CHECKED_OUT: "bg-slate-100 text-slate-800",
  CANCELLED: "bg-red-100 text-red-800",
};

// ─── Invoice Statuses ────────────────────────────────────────
export const INVOICE_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  FINALIZED: "Finalized",
  PAID: "Paid",
  VOID: "Void",
};

export const INVOICE_STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-800",
  FINALIZED: "bg-blue-100 text-blue-800",
  PAID: "bg-emerald-100 text-emerald-800",
  VOID: "bg-red-100 text-red-800",
};

// ─── Purchase Order Statuses ─────────────────────────────────
export const PO_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  APPROVED: "Approved",
  RECEIVED: "Received",
  CANCELLED: "Cancelled",
};

export const PO_STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-800",
  SUBMITTED: "bg-blue-100 text-blue-800",
  APPROVED: "bg-emerald-100 text-emerald-800",
  RECEIVED: "bg-purple-100 text-purple-800",
  CANCELLED: "bg-red-100 text-red-800",
};

// ─── Banquet Statuses ────────────────────────────────────────
export const BANQUET_STATUS_LABELS: Record<string, string> = {
  INQUIRY: "Inquiry",
  CONFIRMED: "Confirmed",
  ADVANCE_RECEIVED: "Advance Received",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

// ─── Task Types ──────────────────────────────────────────────
export const TASK_TYPE_LABELS: Record<string, string> = {
  CHECKOUT: "Checkout Cleaning",
  STAY: "Stay Service",
  DEEP_CLEAN: "Deep Clean",
  TURNDOWN: "Turndown",
  INSPECTION: "Inspection",
};

// ─── Maintenance Categories ──────────────────────────────────
export const MAINTENANCE_CATEGORY_LABELS: Record<string, string> = {
  PLUMBING: "Plumbing",
  ELECTRICAL: "Electrical",
  HVAC: "HVAC",
  FURNITURE: "Furniture",
  APPLIANCE: "Appliance",
  STRUCTURAL: "Structural",
  OTHER: "Other",
};

// ─── Pagination Defaults ─────────────────────────────────────
export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// ─── Debounce ────────────────────────────────────────────────
export const DEBOUNCE_DELAY = 300;
