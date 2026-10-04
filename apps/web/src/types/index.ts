// ─── Base Types ───────────────────────────────────────────────
export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface TenantEntity extends BaseEntity {
  organization_id: string;
  property_id: string;
}

export interface AuditedEntity extends TenantEntity {
  created_by?: string;
  updated_by?: string;
}

// ─── API Response Types ──────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: "ASC" | "DESC";
  [key: string]: any;
}

// ─── Auth Types ──────────────────────────────────────────────
export interface User extends BaseEntity {
  organization_id: string | null;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  avatar_url: string | null;
  is_active: boolean;
  is_email_verified: boolean;
  last_login_at: string | null;
  password_changed_at: string | null;
  roles?: Role[];
}

export interface Role extends BaseEntity {
  organization_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  is_system: boolean;
  is_active: boolean;
  permissions?: Permission[];
}

export interface Permission extends BaseEntity {
  name: string;
  slug: string;
  module: string;
  action: string;
  description: string | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
  tokens?: AuthTokens;
}

// ─── Organization & Property ─────────────────────────────────
export interface Organization extends BaseEntity {
  name: string;
  slug: string;
  email: string;
  phone: string | null;
  address: string | null;
  logo_url: string | null;
  is_active: boolean;
  settings: Record<string, any> | null;
}

export interface Property extends BaseEntity {
  organization_id: string;
  name: string;
  slug: string;
  email: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postal_code: string | null;
  timezone: string;
  currency: string;
  tax_id: string | null;
  is_active: boolean;
  settings: Record<string, any> | null;
  check_in_time: string;
  check_out_time: string;
}

// ─── Room Types ──────────────────────────────────────────────
export interface RoomType extends TenantEntity {
  name: string;
  code: string;
  description: string | null;
  base_rate: number;
  max_occupancy: number;
  max_adults: number;
  max_children: number;
  bed_count: number;
  bed_type: string | null;
  room_area: number | null;
  is_active: boolean;
  amenities: string[] | null;
  image_url: string | null;
  sort_order: number;
}

// ─── Floor ───────────────────────────────────────────────────
export interface Floor extends TenantEntity {
  name: string;
  code: string;
  level: number;
  is_active: boolean;
  description: string | null;
}

// ─── Room ────────────────────────────────────────────────────
export type RoomStatus =
  | "VACANT_CLEAN"
  | "VACANT_DIRTY"
  | "OCCUPIED"
  | "RESERVED"
  | "DIRTY"
  | "CLEANING"
  | "INSPECTION"
  | "MAINTENANCE"
  | "OUT_OF_ORDER";

export interface Room extends TenantEntity {
  room_type_id: string;
  floor_id: string | null;
  number: string;
  name: string | null;
  status: RoomStatus;
  is_active: boolean;
  is_smoking: boolean;
  is_accessible: boolean;
  has_balcony: boolean;
  connecting_room_id: string | null;
  notes: string | null;
  rate_override: number | null;
  last_maintened_at: string | null;
  roomType?: RoomType;
  floor?: Floor;
}

// ─── Guest ───────────────────────────────────────────────────
export interface Guest extends TenantEntity {
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  date_of_birth: string | null;
  gender: string | null;
  nationality: string | null;
  id_type: string | null;
  id_number: string | null;
  id_expiry: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postal_code: string | null;
  company_name: string | null;
  tax_id: string | null;
  vip_status: string | null;
  notes: string | null;
  total_stays: number;
  total_revenue: number;
  last_stay_at: string | null;
  documents?: GuestDocument[];
  preferences?: GuestPreference[];
}

export interface GuestDocument {
  id: string;
  guest_id: string;
  document_type: string;
  document_number: string;
  expiry_date: string | null;
  image_url: string | null;
}

export interface GuestPreference {
  id: string;
  guest_id: string;
  preference_type: string;
  value: string;
}

// ─── Reservation ─────────────────────────────────────────────
export type ReservationStatus =
  | "INQUIRY"
  | "CONFIRMED"
  | "CHECKED_IN"
  | "CHECKED_OUT"
  | "CANCELLED"
  | "NO_SHOW";

export interface Reservation extends AuditedEntity {
  confirmation_number: string;
  status: ReservationStatus;
  check_in_date: string;
  check_out_date: string;
  adults: number;
  children: number;
  rooms_count: number;
  source: string;
  room_type_id: string;
  rate_plan_id: string | null;
  total_amount: number;
  advance_paid: number;
  discount_amount: number;
  tax_amount: number;
  net_amount: number;
  special_requests: string | null;
  notes: string | null;
  cancelled_at: string | null;
  cancelled_by: string | null;
  cancellation_reason: string | null;
  no_show_at: string | null;
  roomType?: RoomType;
  rooms?: ReservationRoom[];
  guests?: ReservationGuest[];
  stay?: Stay;
  creator?: User;
}

export interface ReservationRoom {
  id: string;
  reservation_id: string;
  room_id: string;
  room?: Room;
}

export interface ReservationGuest {
  id: string;
  reservation_id: string;
  guest_id: string;
  is_primary: boolean;
  guest?: Guest;
}

// ─── Stay ────────────────────────────────────────────────────
export type StayStatus = "ACTIVE" | "CHECKED_OUT" | "CANCELLED";

export interface Stay extends AuditedEntity {
  reservation_id: string;
  room_id: string;
  guest_id: string;
  check_in_date: string;
  check_out_date: string;
  actual_check_in: string | null;
  actual_check_out: string | null;
  status: StayStatus;
  adults: number;
  children: number;
  rate: number;
  notes: string | null;
  reservation?: Reservation;
  room?: Room;
  guest?: Guest;
  folio?: Folio;
}

// ─── Folio ───────────────────────────────────────────────────
export type FolioStatus = "OPEN" | "CLOSED" | "SETTLED";

export interface Folio extends TenantEntity {
  stay_id: string;
  folio_number: string;
  status: FolioStatus;
  total_charges: number;
  total_payments: number;
  total_taxes: number;
  total_discounts: number;
  total_refunds: number;
  balance: number;
  items?: FolioItem[];
  payments?: Payment[];
  stay?: Stay;
}

export interface FolioItem {
  id: string;
  folio_id: string;
  description: string;
  category: string;
  quantity: number;
  unit_price: number;
  amount: number;
  tax_amount: number;
  discount_amount: number;
  net_amount: number;
  reference_type: string | null;
  reference_id: string | null;
  posted_by: string | null;
  posted_at: string;
}

// ─── Payment ─────────────────────────────────────────────────
export type PaymentMethod = "CASH" | "CARD" | "UPI" | "BANK_TRANSFER" | "OTHER";
export type PaymentStatus =
  | "COMPLETED"
  | "PENDING"
  | "FAILED"
  | "REFUNDED"
  | "PARTIALLY_REFUNDED";

export interface Payment extends TenantEntity {
  folio_id: string | null;
  stay_id: string | null;
  guest_id: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  reference_number: string | null;
  card_last_four: string | null;
  card_type: string | null;
  notes: string | null;
  processed_by: string | null;
  processed_at: string;
}

// ─── Invoice ─────────────────────────────────────────────────
export type InvoiceStatus = "DRAFT" | "FINALIZED" | "PAID" | "VOID";

export interface Invoice extends TenantEntity {
  invoice_number: string;
  stay_id: string;
  guest_id: string;
  status: InvoiceStatus;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  paid_amount: number;
  balance: number;
  notes: string | null;
  issued_at: string;
  paid_at: string | null;
  stay?: Stay;
  guest?: Guest;
}

// ─── Housekeeping ────────────────────────────────────────────
export type HousekeepingStatus =
  | "PENDING"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "INSPECTED";

export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type TaskType = "CHECKOUT" | "STAY" | "DEEP_CLEAN" | "TURNDOWN" | "INSPECTION";

export interface HousekeepingTask extends TenantEntity {
  room_id: string;
  task_type: TaskType;
  priority: TaskPriority;
  status: HousekeepingStatus;
  assigned_to: string | null;
  notes: string | null;
  started_at: string | null;
  completed_at: string | null;
  inspected_by: string | null;
  inspected_at: string | null;
  room?: Room;
}

// ─── Maintenance ─────────────────────────────────────────────
export type MaintenanceStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
export type MaintenanceCategory =
  | "PLUMBING"
  | "ELECTRICAL"
  | "HVAC"
  | "FURNITURE"
  | "APPLIANCE"
  | "STRUCTURAL"
  | "OTHER";

export interface MaintenanceTicket extends TenantEntity {
  room_id: string | null;
  title: string;
  description: string;
  category: MaintenanceCategory;
  priority: TaskPriority;
  status: MaintenanceStatus;
  assigned_to: string | null;
  reported_by: string;
  notes: string | null;
  started_at: string | null;
  resolved_at: string | null;
  closed_at: string | null;
  room?: Room;
}

// ─── POS ─────────────────────────────────────────────────────
export interface Restaurant extends TenantEntity {
  outlet_id: string;
  name: string;
  code: string;
  is_active: boolean;
  is_active_for_room_service: boolean;
  tables?: Table[];
}

export interface Table extends TenantEntity {
  restaurant_id: string;
  number: string;
  capacity: number;
  status: "AVAILABLE" | "OCCUPIED" | "RESERVED" | "OUT_OF_SERVICE";
  section: string | null;
  restaurant?: Restaurant;
}

export interface MenuCategory extends TenantEntity {
  name: string;
  code: string;
  is_active: boolean;
  sort_order: number;
}

export interface MenuItem extends TenantEntity {
  category_id: string;
  name: string;
  code: string;
  description: string | null;
  price: number;
  cost_price: number;
  is_available: boolean;
  is_veg: boolean;
  preparation_time: number | null;
  image_url: string | null;
  tax_ids: string[] | null;
  sort_order: number;
  category?: MenuCategory;
  modifiers?: MenuModifier[];
}

export interface MenuModifier extends TenantEntity {
  menu_item_id: string;
  name: string;
  price: number;
  is_available: boolean;
}

export type OrderStatus =
  | "PLACED"
  | "CONFIRMED"
  | "PREPARING"
  | "READY"
  | "SERVED"
  | "COMPLETED"
  | "CANCELLED";

export type OrderType = "DINE_IN" | "TAKEAWAY" | "ROOM_SERVICE" | "DELIVERY";

export interface Order extends TenantEntity {
  order_number: string;
  restaurant_id: string;
  table_id: string | null;
  stay_id: string | null;
  room_number: string | null;
  order_type: OrderType;
  status: OrderStatus;
  guest_count: number;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  notes: string | null;
  ordered_by: string | null;
  restaurant?: Restaurant;
  table?: Table;
  items?: OrderItem[];
  kot?: Kot;
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  name: string;
  quantity: number;
  unit_price: number;
  amount: number;
  tax_amount: number;
  discount_amount: number;
  modifiers: Record<string, any>[] | null;
  special_instructions: string | null;
  status: string;
}

export type KotStatus = "PRINTED" | "PREPARING" | "READY" | "SERVED" | "CANCELLED";

export interface Kot extends TenantEntity {
  order_id: string;
  kot_number: string;
  status: KotStatus;
  priority: string;
  notes: string | null;
  printed_at: string | null;
  started_at: string | null;
  ready_at: string | null;
  served_at: string | null;
  order?: Order;
}

// ─── Inventory ───────────────────────────────────────────────
export interface InventoryCategory extends TenantEntity {
  name: string;
  code: string;
  description: string | null;
  is_active: boolean;
}

export interface Unit extends TenantEntity {
  name: string;
  code: string;
  is_active: boolean;
}

export interface InventoryItem extends TenantEntity {
  category_id: string;
  unit_id: string;
  name: string;
  code: string;
  description: string | null;
  sku: string | null;
  barcode: string | null;
  current_stock: number;
  minimum_stock: number;
  maximum_stock: number;
  reorder_point: number;
  cost_price: number;
  selling_price: number;
  is_active: boolean;
  is_consumable: boolean;
  category?: InventoryCategory;
  unit?: Unit;
}

export interface StockTransaction extends TenantEntity {
  inventory_item_id: string;
  transaction_type: string;
  quantity: number;
  reference_type: string | null;
  reference_id: string | null;
  notes: string | null;
  performed_by: string | null;
}

// ─── Vendor ──────────────────────────────────────────────────
export interface Vendor extends TenantEntity {
  name: string;
  code: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postal_code: string | null;
  tax_id: string | null;
  payment_terms: string | null;
  notes: string | null;
  is_active: boolean;
  rating: number | null;
}

// ─── Purchase Order ──────────────────────────────────────────
export type POStatus = "DRAFT" | "SUBMITTED" | "APPROVED" | "RECEIVED" | "CANCELLED";

export interface PurchaseOrder extends AuditedEntity {
  po_number: string;
  vendor_id: string;
  status: POStatus;
  order_date: string;
  expected_delivery_date: string | null;
  actual_delivery_date: string | null;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  notes: string | null;
  approved_by: string | null;
  approved_at: string | null;
  vendor?: Vendor;
  items?: PurchaseOrderItem[];
}

export interface PurchaseOrderItem {
  id: string;
  purchase_order_id: string;
  inventory_item_id: string;
  quantity: number;
  received_quantity: number;
  unit_price: number;
  tax_amount: number;
  total_amount: number;
  inventory_item?: InventoryItem;
}

// ─── Banquet ─────────────────────────────────────────────────
export interface BanquetHall extends TenantEntity {
  name: string;
  code: string;
  capacity: number;
  area: number | null;
  floor: string | null;
  rate_per_hour: number;
  rate_per_day: number;
  is_active: boolean;
  amenities: string[] | null;
  image_url: string | null;
}

export type BanquetEventStatus =
  | "INQUIRY"
  | "CONFIRMED"
  | "ADVANCE_RECEIVED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export interface BanquetEvent extends AuditedEntity {
  banquet_hall_id: string;
  event_name: string;
  event_type: string;
  status: BanquetEventStatus;
  event_date: string;
  start_time: string;
  end_time: string;
  guest_count: number;
  contact_name: string;
  contact_email: string | null;
  contact_phone: string;
  company_name: string | null;
  hall_charges: number;
  food_charges: number;
  additional_charges: number;
  total_amount: number;
  advance_paid: number;
  discount_amount: number;
  tax_amount: number;
  net_amount: number;
  special_requests: string | null;
  notes: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  banquetHall?: BanquetHall;
  items?: EventItem[];
}

export interface EventItem {
  id: string;
  event_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

// ─── Loyalty ─────────────────────────────────────────────────
export interface MembershipPlan extends TenantEntity {
  name: string;
  code: string;
  description: string | null;
  points_per_dollar: number;
  minimum_points_for_redemption: number;
  redemption_value_per_point: number;
  tier_level: number;
  benefits: Record<string, any> | null;
  is_active: boolean;
}

export interface Member extends TenantEntity {
  membership_plan_id: string;
  guest_id: string;
  member_number: string;
  points_balance: number;
  lifetime_points: number;
  total_redemption: number;
  status: string;
  joined_at: string;
  tier_level: number;
  membershipPlan?: MembershipPlan;
  guest?: Guest;
}

export interface LoyaltyTransaction extends TenantEntity {
  member_id: string;
  transaction_type: string;
  points: number;
  balance_after: number;
  reference_type: string | null;
  reference_id: string | null;
  description: string | null;
  performed_by: string | null;
}

// ─── Tax & Discount ──────────────────────────────────────────
export interface Tax extends TenantEntity {
  name: string;
  code: string;
  rate: number;
  is_active: boolean;
}

export interface Discount extends TenantEntity {
  name: string;
  code: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  max_amount: number | null;
  is_active: boolean;
  valid_from: string | null;
  valid_until: string | null;
}

// ─── Report Types ────────────────────────────────────────────
export interface DashboardData {
  occupancy: {
    total: number;
    occupied: number;
    available: number;
    dirty: number;
    maintenance: number;
    outOfOrder: number;
    occupancyRate: number;
  };
  arrivals: {
    count: number;
    guests: Stay[];
  };
  departures: {
    count: number;
    guests: Stay[];
  };
  revenue: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
  rooms: {
    vacantClean: number;
    occupied: number;
    reserved: number;
    dirty: number;
    maintenance: number;
  };
}

export interface OccupancyReport {
  date: string;
  totalRooms: number;
  occupied: number;
  available: number;
  occupancyRate: number;
}

export interface DailyRevenueReport {
  date: string;
  roomRevenue: number;
  posRevenue: number;
  otherRevenue: number;
  totalRevenue: number;
  tax: number;
  discount: number;
  netRevenue: number;
}

// ─── Room Status Summary ─────────────────────────────────────
export interface RoomStatusSummary {
  VACANT_CLEAN: number;
  VACANT_DIRTY: number;
  OCCUPIED: number;
  RESERVED: number;
  DIRTY: number;
  CLEANING: number;
  INSPECTION: number;
  MAINTENANCE: number;
  OUT_OF_ORDER: number;
  TOTAL: number;
}

// ─── Availability ────────────────────────────────────────────
export interface RoomTypeAvailability {
  room_type_id: string;
  room_type_name: string;
  room_type_code: string;
  total_rooms: number;
  available: number;
  blocked: number;
}

export interface RoomAvailability {
  room_id: string;
  room_number: string;
  room_type: { id: string; name: string; code: string } | null;
  status: string;
  is_booked: boolean;
  is_occupied: boolean;
  is_available: boolean;
  reservations: Array<{
    room_id: string;
    check_in_date: string;
    check_out_date: string;
    reservation_status: string;
  }>;
  stays: Array<{
    room_id: string;
    check_in_date: string;
    check_out_date: string;
  }>;
}

// ─── WebSocket Events ────────────────────────────────────────
export type WSEventType =
  | "room.updated"
  | "reservation.updated"
  | "housekeeping.updated"
  | "maintenance.updated"
  | "kot.created"
  | "kot.updated"
  | "pos.updated"
  | "notification";

export interface WSEvent {
  type: WSEventType;
  data: any;
  property_id: string;
  timestamp: string;
}

// ─── Toast Types ─────────────────────────────────────────────
export type ToastVariant = "default" | "success" | "error" | "warning" | "info";
