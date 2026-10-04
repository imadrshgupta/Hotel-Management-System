import api from "./axios";
import type {
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
  User,
  Role,
  Property,
  Room,
  RoomType,
  Floor,
  Guest,
  Reservation,
  Stay,
  Folio,
  FolioItem,
  Payment,
  Invoice,
  HousekeepingTask,
  MaintenanceTicket,
  Order,
  OrderItem,
  Kot,
  Restaurant,
  Table,
  MenuItem,
  MenuCategory,
  InventoryItem,
  Vendor,
  PurchaseOrder,
  BanquetHall,
  BanquetEvent,
  Member,
  MembershipPlan,
  LoyaltyTransaction,
  DashboardData,
  RoomStatusSummary,
  RoomTypeAvailability,
  RoomAvailability,
  Tax,
  Discount,
} from "@/types";

// ─── Helper ──────────────────────────────────────────────────
function qs(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });
  const str = searchParams.toString();
  return str ? `?${str}` : "";
}

// ─── Users ───────────────────────────────────────────────────
export const usersApi = {
  list: (params: PaginationParams = {}) =>
    api.get<PaginatedResponse<User>>(`/users${qs(params)}`).then((r) => r.data),

  get: (id: string) =>
    api.get<ApiResponse<User>>(`/users/${id}`).then((r) => r.data.data),

  create: (data: Partial<User> & { password: string; role_ids?: string[] }) =>
    api.post<ApiResponse<User>>("/users", data).then((r) => r.data.data),

  update: (id: string, data: Partial<User> & { role_ids?: string[] }) =>
    api.patch<ApiResponse<User>>(`/users/${id}`, data).then((r) => r.data.data),

  delete: (id: string) =>
    api.delete(`/users/${id}`).then((r) => r.data),
};

// ─── Properties ──────────────────────────────────────────────
export const propertiesApi = {
  list: (params: PaginationParams = {}) =>
    api.get<PaginatedResponse<Property>>(`/properties${qs(params)}`).then((r) => r.data),

  get: (id: string) =>
    api.get<ApiResponse<Property>>(`/properties/${id}`).then((r) => r.data.data),

  create: (data: Partial<Property>) =>
    api.post<ApiResponse<Property>>("/properties", data).then((r) => r.data.data),

  update: (id: string, data: Partial<Property>) =>
    api.patch<ApiResponse<Property>>(`/properties/${id}`, data).then((r) => r.data.data),
};

// ─── Floors ──────────────────────────────────────────────────
export const floorsApi = {
  list: () =>
    api.get<ApiResponse<Floor[]>>("/floors").then((r) => r.data.data),

  get: (id: string) =>
    api.get<ApiResponse<Floor>>(`/floors/${id}`).then((r) => r.data.data),

  create: (data: Partial<Floor>) =>
    api.post<ApiResponse<Floor>>("/floors", data).then((r) => r.data.data),

  update: (id: string, data: Partial<Floor>) =>
    api.patch<ApiResponse<Floor>>(`/floors/${id}`, data).then((r) => r.data.data),

  delete: (id: string) =>
    api.delete(`/floors/${id}`).then((r) => r.data),
};

// ─── Room Types ──────────────────────────────────────────────
export const roomTypesApi = {
  list: (params?: { is_active?: boolean }) =>
    api.get<ApiResponse<RoomType[]>>(`/room-types${qs(params || {})}`).then((r) => r.data.data),

  get: (id: string) =>
    api.get<ApiResponse<RoomType>>(`/room-types/${id}`).then((r) => r.data.data),

  create: (data: Partial<RoomType>) =>
    api.post<ApiResponse<RoomType>>("/room-types", data).then((r) => r.data.data),

  update: (id: string, data: Partial<RoomType>) =>
    api.patch<ApiResponse<RoomType>>(`/room-types/${id}`, data).then((r) => r.data.data),

  delete: (id: string) =>
    api.delete(`/room-types/${id}`).then((r) => r.data),
};

// ─── Rooms ───────────────────────────────────────────────────
export const roomsApi = {
  list: (params: PaginationParams = {}) =>
    api.get<PaginatedResponse<Room>>(`/rooms${qs(params)}`).then((r) => r.data),

  get: (id: string) =>
    api.get<ApiResponse<Room>>(`/rooms/${id}`).then((r) => r.data.data),

  getStatusSummary: () =>
    api.get<ApiResponse<RoomStatusSummary>>("/rooms/status-summary").then((r) => r.data.data),

  getStatusHistory: (id: string) =>
    api.get<ApiResponse<any[]>>(`/rooms/${id}/status-history`).then((r) => r.data.data),

  create: (data: Partial<Room>) =>
    api.post<ApiResponse<Room>>("/rooms", data).then((r) => r.data.data),

  update: (id: string, data: Partial<Room>) =>
    api.patch<ApiResponse<Room>>(`/rooms/${id}`, data).then((r) => r.data.data),

  delete: (id: string) =>
    api.delete(`/rooms/${id}`).then((r) => r.data),

  changeStatus: (id: string, status: string, reason?: string) =>
    api.patch<ApiResponse<Room>>(`/rooms/${id}/status`, { status, reason }).then((r) => r.data.data),
};

// ─── Guests ──────────────────────────────────────────────────
export const guestsApi = {
  list: (params: PaginationParams = {}) =>
    api.get<PaginatedResponse<Guest>>(`/guests${qs(params)}`).then((r) => r.data),

  get: (id: string) =>
    api.get<ApiResponse<Guest>>(`/guests/${id}`).then((r) => r.data.data),

  searchDuplicate: (params: { email?: string; phone?: string }) =>
    api.get<ApiResponse<Guest[]>>("/guests/search-duplicate", { params }).then((r) => r.data.data),

  create: (data: Partial<Guest>) =>
    api.post<ApiResponse<Guest>>("/guests", data).then((r) => r.data.data),

  update: (id: string, data: Partial<Guest>) =>
    api.patch<ApiResponse<Guest>>(`/guests/${id}`, data).then((r) => r.data.data),

  delete: (id: string) =>
    api.delete(`/guests/${id}`).then((r) => r.data),

  addDocument: (id: string, data: any) =>
    api.post<ApiResponse<any>>(`/guests/${id}/documents`, data).then((r) => r.data.data),

  addPreference: (id: string, data: any) =>
    api.post<ApiResponse<any>>(`/guests/${id}/preferences`, data).then((r) => r.data.data),
};

// ─── Reservations ────────────────────────────────────────────
export const reservationsApi = {
  list: (params: PaginationParams = {}) =>
    api.get<PaginatedResponse<Reservation>>(`/reservations${qs(params)}`).then((r) => r.data),

  get: (id: string) =>
    api.get<ApiResponse<Reservation>>(`/reservations/${id}`).then((r) => r.data.data),

  create: (data: {
    check_in_date: string;
    check_out_date: string;
    adults: number;
    children?: number;
    room_type_id: string;
    guest: {
      first_name: string;
      last_name: string;
      email?: string;
      phone?: string;
      id_type?: string;
      id_number?: string;
    };
    special_requests?: string;
    notes?: string;
    advance_paid?: number;
    source?: string;
  }) => api.post<ApiResponse<Reservation>>("/reservations", data).then((r) => r.data.data),

  update: (id: string, data: Partial<Reservation>) =>
    api.patch<ApiResponse<Reservation>>(`/reservations/${id}`, data).then((r) => r.data.data),

  confirm: (id: string) =>
    api.post<ApiResponse<Reservation>>(`/reservations/${id}/confirm`).then((r) => r.data.data),

  cancel: (id: string, reason?: string) =>
    api.post<ApiResponse<Reservation>>(`/reservations/${id}/cancel`, { reason }).then((r) => r.data.data),

  noShow: (id: string) =>
    api.post<ApiResponse<Reservation>>(`/reservations/${id}/no-show`).then((r) => r.data.data),
};

// ─── Stays ───────────────────────────────────────────────────
export const staysApi = {
  list: (params: PaginationParams = {}) =>
    api.get<PaginatedResponse<Stay>>(`/stays${qs(params)}`).then((r) => r.data),

  getActive: () =>
    api.get<ApiResponse<Stay[]>>("/stays/active").then((r) => r.data.data),

  get: (id: string) =>
    api.get<ApiResponse<Stay>>(`/stays/${id}`).then((r) => r.data.data),

  checkIn: (data: {
    reservation_id: string;
    room_id: string;
    guest_id: string;
    actual_check_in?: string;
    notes?: string;
  }) => api.post<ApiResponse<Stay>>("/stays/check-in", data).then((r) => r.data.data),

  checkOut: (id: string, data?: { actual_check_out?: string; notes?: string }) =>
    api.post<ApiResponse<Stay>>(`/stays/${id}/check-out`, data || {}).then((r) => r.data.data),

  extendStay: (id: string, check_out_date: string) =>
    api.patch<ApiResponse<Stay>>(`/stays/${id}/extend`, { check_out_date }).then((r) => r.data.data),
};

// ─── Folios ──────────────────────────────────────────────────
export const foliosApi = {
  getByStay: (stayId: string) =>
    api.get<ApiResponse<Folio>>(`/folios/stay/${stayId}`).then((r) => r.data.data),

  get: (id: string) =>
    api.get<ApiResponse<Folio>>(`/folios/${id}`).then((r) => r.data.data),

  // Backend computes amount & net_amount from quantity × unit_price
  addItem: (id: string, data: {
    description: string;
    category: string;
    quantity: number;
    unit_price: number;
    tax_amount?: number;
    discount_amount?: number;
    reference_type?: string;
    reference_id?: string;
  }) => api.post<ApiResponse<FolioItem>>(`/folios/${id}/items`, data).then((r) => r.data.data),

  removeItem: (id: string, itemId: string) =>
    api.delete(`/folios/${id}/items/${itemId}`).then((r) => r.data),
};

// ─── Payments ────────────────────────────────────────────────
export const paymentsApi = {
  get: (id: string) =>
    api.get<ApiResponse<Payment>>(`/payments/${id}`).then((r) => r.data.data),

  getByFolio: (folioId: string) =>
    api.get<ApiResponse<Payment[]>>(`/payments/folio/${folioId}`).then((r) => r.data.data),

  // Matches the backend contract: the API resolves the open folio from stay_id
  create: (data: {
    stay_id: string;
    amount: number;
    method: string;
    reference_number?: string;
    card_last_four?: string;
    card_type?: string;
    notes?: string;
  }) => api.post<ApiResponse<Payment>>("/payments", data).then((r) => r.data.data),

  refund: (id: string, data: { amount?: number; reason?: string }) =>
    api.post<ApiResponse<Payment>>(`/payments/${id}/refund`, data).then((r) => r.data.data),
};

// ─── Invoices ────────────────────────────────────────────────
export const invoicesApi = {
  list: (params: PaginationParams = {}) =>
    api.get<PaginatedResponse<Invoice>>(`/invoices${qs(params)}`).then((r) => r.data),

  get: (id: string) =>
    api.get<ApiResponse<Invoice>>(`/invoices/${id}`).then((r) => r.data.data),

  generate: (data: { stay_id: string }) =>
    api.post<ApiResponse<Invoice>>("/invoices/generate", data).then((r) => r.data.data),

  finalize: (id: string) =>
    api.post<ApiResponse<Invoice>>(`/invoices/${id}/finalize`).then((r) => r.data.data),

  void: (id: string) =>
    api.post<ApiResponse<Invoice>>(`/invoices/${id}/void`).then((r) => r.data.data),
};

// ─── Housekeeping ────────────────────────────────────────────
export const housekeepingApi = {
  list: (params: PaginationParams = {}) =>
    api.get<PaginatedResponse<HousekeepingTask>>(`/housekeeping${qs(params)}`).then((r) => r.data),

  get: (id: string) =>
    api.get<ApiResponse<HousekeepingTask>>(`/housekeeping/${id}`).then((r) => r.data.data),

  assign: (id: string, userId: string) =>
    api.post<ApiResponse<HousekeepingTask>>(`/housekeeping/${id}/assign`, { user_id: userId }).then((r) => r.data.data),

  start: (id: string) =>
    api.post<ApiResponse<HousekeepingTask>>(`/housekeeping/${id}/start`).then((r) => r.data.data),

  complete: (id: string) =>
    api.post<ApiResponse<HousekeepingTask>>(`/housekeeping/${id}/complete`).then((r) => r.data.data),

  inspect: (id: string) =>
    api.post<ApiResponse<HousekeepingTask>>(`/housekeeping/${id}/inspect`).then((r) => r.data.data),
};

// ─── Maintenance ─────────────────────────────────────────────
export const maintenanceApi = {
  list: (params: PaginationParams = {}) =>
    api.get<PaginatedResponse<MaintenanceTicket>>(`/maintenance${qs(params)}`).then((r) => r.data),

  get: (id: string) =>
    api.get<ApiResponse<MaintenanceTicket>>(`/maintenance/${id}`).then((r) => r.data.data),

  create: (data: Partial<MaintenanceTicket>) =>
    api.post<ApiResponse<MaintenanceTicket>>("/maintenance", data).then((r) => r.data.data),

  update: (id: string, data: Partial<MaintenanceTicket>) =>
    api.patch<ApiResponse<MaintenanceTicket>>(`/maintenance/${id}`, data).then((r) => r.data.data),
};

// ─── POS ─────────────────────────────────────────────────────
export const posApi = {
  listOrders: (params: PaginationParams = {}) =>
    api.get<PaginatedResponse<Order>>(`/pos${qs(params)}`).then((r) => r.data),

  getOrder: (id: string) =>
    api.get<ApiResponse<Order>>(`/pos/${id}`).then((r) => r.data.data),

  createOrder: (data: any) =>
    api.post<ApiResponse<Order>>("/pos", data).then((r) => r.data.data),

  postToRoom: (orderId: string, stayId: string) =>
    api.post<ApiResponse<any>>(`/pos/${orderId}/post-to-room`, { stay_id: stayId }).then((r) => r.data.data),
};

// ─── Availability ────────────────────────────────────────────
export const availabilityApi = {
  getRoomTypeAvailability: (params: {
    check_in_date: string;
    check_out_date: string;
    room_type_id?: string;
    adults?: number;
  }) =>
    api.get<ApiResponse<RoomTypeAvailability[]>>("/availability/room-types", { params }).then((r) => r.data.data),

  getRoomAvailability: (params: {
    start_date: string;
    end_date: string;
  }) =>
    api.get<ApiResponse<RoomAvailability[]>>("/availability/rooms", { params }).then((r) => r.data.data),

  getOccupancy: (date: string) =>
    api.get<ApiResponse<any>>("/availability/occupancy", { params: { date } }).then((r) => r.data.data),
};

// ─── Reports ─────────────────────────────────────────────────
export const reportsApi = {
  getArrivals: (date?: string) =>
    api.get<ApiResponse<any>>("/reports/arrivals", { params: { date } }).then((r) => r.data.data),

  getDepartures: (date?: string) =>
    api.get<ApiResponse<any>>("/reports/departures", { params: { date } }).then((r) => r.data.data),

  getInHouse: () =>
    api.get<ApiResponse<any>>("/reports/in-house").then((r) => r.data.data),

  getRoomStatus: () =>
    api.get<ApiResponse<any>>("/reports/room-status").then((r) => r.data.data),

  getDailyRevenue: (date?: string) =>
    api.get<ApiResponse<any>>("/reports/daily-revenue", { params: { date } }).then((r) => r.data.data),

  getOccupancy: (start_date: string, end_date: string) =>
    api.get<ApiResponse<any>>("/reports/occupancy", { params: { start_date, end_date } }).then((r) => r.data.data),

  getPayments: (start_date: string, end_date: string) =>
    api.get<ApiResponse<any>>("/reports/payments", { params: { start_date, end_date } }).then((r) => r.data.data),

  getOutstanding: () =>
    api.get<ApiResponse<any>>("/reports/outstanding").then((r) => r.data.data),
};
