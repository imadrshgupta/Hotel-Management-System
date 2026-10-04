// Room states
export const RoomStatus = {
  VACANT_CLEAN: 'VACANT_CLEAN',
  VACANT_DIRTY: 'VACANT_DIRTY',
  RESERVED: 'RESERVED',
  OCCUPIED: 'OCCUPIED',
  DIRTY: 'DIRTY',
  CLEANING: 'CLEANING',
  INSPECTION: 'INSPECTION',
  OUT_OF_ORDER: 'OUT_OF_ORDER',
  MAINTENANCE: 'MAINTENANCE',
} as const;

export type RoomStatusType = keyof typeof RoomStatus;

// Room status transitions (allowed transitions)
export const ROOM_STATUS_TRANSITIONS: Record<string, string[]> = {
  VACANT_CLEAN: ['RESERVED', 'OUT_OF_ORDER', 'MAINTENANCE'],
  VACANT_DIRTY: ['RESERVED', 'OUT_OF_ORDER', 'MAINTENANCE', 'CLEANING'],
  RESERVED: ['OCCUPIED', 'OUT_OF_ORDER', 'MAINTENANCE'],
  OCCUPIED: ['DIRTY', 'OUT_OF_ORDER', 'MAINTENANCE'],
  DIRTY: ['CLEANING', 'OUT_OF_ORDER', 'MAINTENANCE'],
  CLEANING: ['INSPECTION', 'VACANT_CLEAN'],
  INSPECTION: ['VACANT_CLEAN', 'DIRTY'],
  OUT_OF_ORDER: ['MAINTENANCE', 'VACANT_DIRTY'],
  MAINTENANCE: ['OUT_OF_ORDER', 'VACANT_DIRTY'],
};

// Reservation statuses
export const ReservationStatus = {
  INQUIRY: 'INQUIRY',
  TENTATIVE: 'TENTATIVE',
  CONFIRMED: 'CONFIRMED',
  CHECKED_IN: 'CHECKED_IN',
  CHECKED_OUT: 'CHECKED_OUT',
  CANCELLED: 'CANCELLED',
  NO_SHOW: 'NO_SHOW',
} as const;

export type ReservationStatusType = keyof typeof ReservationStatus;

// Reservation status transitions
export const RESERVATION_STATUS_TRANSITIONS: Record<string, string[]> = {
  INQUIRY: ['TENTATIVE', 'CONFIRMED', 'CANCELLED'],
  TENTATIVE: ['CONFIRMED', 'CANCELLED', 'NO_SHOW'],
  CONFIRMED: ['CHECKED_IN', 'CANCELLED', 'NO_SHOW'],
  CHECKED_IN: ['CHECKED_OUT'],
  CHECKED_OUT: [],
  CANCELLED: [],
  NO_SHOW: [],
};

// Payment methods
export const PaymentMethod = {
  CASH: 'CASH',
  CARD: 'CARD',
  UPI: 'UPI',
  BANK_TRANSFER: 'BANK_TRANSFER',
  OTHER: 'OTHER',
} as const;

export type PaymentMethodType = keyof typeof PaymentMethod;

// Payment statuses
export const PaymentStatus = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
  PARTIALLY_REFUNDED: 'PARTIALLY_REFUNDED',
} as const;

export type PaymentStatusType = keyof typeof PaymentStatus;

// Housekeeping statuses
export const HousekeepingStatus = {
  PENDING: 'PENDING',
  ASSIGNED: 'ASSIGNED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  INSPECTED: 'INSPECTED',
} as const;

export type HousekeepingStatusType = keyof typeof HousekeepingStatus;

// Housekeeping task types
export const HousekeepingTaskType = {
  CHECKOUT: 'CHECKOUT',
  STAY_OVER: 'STAY_OVER',
  DEEP_CLEAN: 'DEEP_CLEAN',
  TURNDOWN: 'TURNDOWN',
  SPECIAL: 'SPECIAL',
} as const;

// Maintenance statuses
export const MaintenanceStatus = {
  OPEN: 'OPEN',
  ASSIGNED: 'ASSIGNED',
  IN_PROGRESS: 'IN_PROGRESS',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
} as const;

export type MaintenanceStatusType = keyof typeof MaintenanceStatus;

// Priority levels
export const Priority = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT',
} as const;

// POS order statuses
export const OrderStatus = {
  PLACED: 'PLACED',
  PREPARING: 'PREPARING',
  READY: 'READY',
  SERVED: 'SERVED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

export type OrderStatusType = keyof typeof OrderStatus;

// KOT statuses
export const KotStatus = {
  PRINTED: 'PRINTED',
  PREPARING: 'PREPARING',
  READY: 'READY',
  SERVED: 'SERVED',
  CANCELLED: 'CANCELLED',
} as const;

// Banquet event statuses
export const BanquetEventStatus = {
  INQUIRY: 'INQUIRY',
  HOLD: 'HOLD',
  CONFIRMED: 'CONFIRMED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CLOSED: 'CLOSED',
} as const;

// Inventory transaction types
export const StockTransactionType = {
  PURCHASE: 'PURCHASE',
  ISSUE: 'ISSUE',
  TRANSFER: 'TRANSFER',
  ADJUSTMENT: 'ADJUSTMENT',
  CONSUMPTION: 'CONSUMPTION',
  RETURN: 'RETURN',
} as const;

// Booking sources
export const BookingSource = {
  DIRECT: 'DIRECT',
  PHONE: 'PHONE',
  EMAIL: 'EMAIL',
  WEBSITE: 'WEBSITE',
  OTA: 'OTA',
  AGENT: 'AGENT',
  CORPORATE: 'CORPORATE',
  WALK_IN: 'WALK_IN',
} as const;

// Invoice statuses
export const InvoiceStatus = {
  DRAFT: 'DRAFT',
  FINAL: 'FINAL',
  PAID: 'PAID',
  PARTIALLY_PAID: 'PARTIALLY_PAID',
  VOID: 'VOID',
} as const;
