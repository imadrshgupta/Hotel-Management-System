import {
  RoomStatus,
  ROOM_STATUS_TRANSITIONS,
  ReservationStatus,
  RESERVATION_STATUS_TRANSITIONS,
  PaymentMethod,
  PaymentStatus,
  HousekeepingStatus,
  MaintenanceStatus,
  Priority,
  OrderStatus,
  KotStatus,
  BanquetEventStatus,
  StockTransactionType,
  BookingSource,
  InvoiceStatus,
} from '../index';

describe('Constants', () => {
  describe('RoomStatus', () => {
    it('should have all room statuses', () => {
      expect(RoomStatus.VACANT_CLEAN).toBe('VACANT_CLEAN');
      expect(RoomStatus.VACANT_DIRTY).toBe('VACANT_DIRTY');
      expect(RoomStatus.RESERVED).toBe('RESERVED');
      expect(RoomStatus.OCCUPIED).toBe('OCCUPIED');
      expect(RoomStatus.DIRTY).toBe('DIRTY');
      expect(RoomStatus.CLEANING).toBe('CLEANING');
      expect(RoomStatus.INSPECTION).toBe('INSPECTION');
      expect(RoomStatus.OUT_OF_ORDER).toBe('OUT_OF_ORDER');
      expect(RoomStatus.MAINTENANCE).toBe('MAINTENANCE');
    });
  });

  describe('ROOM_STATUS_TRANSITIONS', () => {
    it('should allow valid transitions', () => {
      expect(ROOM_STATUS_TRANSITIONS.VACANT_CLEAN).toContain('RESERVED');
      expect(ROOM_STATUS_TRANSITIONS.OCCUPIED).toContain('DIRTY');
      expect(ROOM_STATUS_TRANSITIONS.DIRTY).toContain('CLEANING');
      expect(ROOM_STATUS_TRANSITIONS.CLEANING).toContain('INSPECTION');
      expect(ROOM_STATUS_TRANSITIONS.INSPECTION).toContain('VACANT_CLEAN');
    });

    it('should not allow invalid transitions', () => {
      expect(ROOM_STATUS_TRANSITIONS.VACANT_CLEAN).not.toContain('OCCUPIED');
      expect(ROOM_STATUS_TRANSITIONS.OCCUPIED).not.toContain('RESERVED');
    });
  });

  describe('ReservationStatus', () => {
    it('should have all reservation statuses', () => {
      expect(ReservationStatus.INQUIRY).toBe('INQUIRY');
      expect(ReservationStatus.TENTATIVE).toBe('TENTATIVE');
      expect(ReservationStatus.CONFIRMED).toBe('CONFIRMED');
      expect(ReservationStatus.CHECKED_IN).toBe('CHECKED_IN');
      expect(ReservationStatus.CHECKED_OUT).toBe('CHECKED_OUT');
      expect(ReservationStatus.CANCELLED).toBe('CANCELLED');
      expect(ReservationStatus.NO_SHOW).toBe('NO_SHOW');
    });
  });

  describe('RESERVATION_STATUS_TRANSITIONS', () => {
    it('should allow valid transitions', () => {
      expect(RESERVATION_STATUS_TRANSITIONS.INQUIRY).toContain('CONFIRMED');
      expect(RESERVATION_STATUS_TRANSITIONS.CONFIRMED).toContain('CHECKED_IN');
      expect(RESERVATION_STATUS_TRANSITIONS.CHECKED_IN).toContain('CHECKED_OUT');
    });

    it('should not allow transitions from terminal states', () => {
      expect(RESERVATION_STATUS_TRANSITIONS.CHECKED_OUT).toHaveLength(0);
      expect(RESERVATION_STATUS_TRANSITIONS.CANCELLED).toHaveLength(0);
      expect(RESERVATION_STATUS_TRANSITIONS.NO_SHOW).toHaveLength(0);
    });
  });

  describe('PaymentMethod', () => {
    it('should have all payment methods', () => {
      expect(PaymentMethod.CASH).toBe('CASH');
      expect(PaymentMethod.CARD).toBe('CARD');
      expect(PaymentMethod.UPI).toBe('UPI');
      expect(PaymentMethod.BANK_TRANSFER).toBe('BANK_TRANSFER');
      expect(PaymentMethod.OTHER).toBe('OTHER');
    });
  });

  describe('PaymentStatus', () => {
    it('should have all payment statuses', () => {
      expect(PaymentStatus.PENDING).toBe('PENDING');
      expect(PaymentStatus.COMPLETED).toBe('COMPLETED');
      expect(PaymentStatus.FAILED).toBe('FAILED');
      expect(PaymentStatus.REFUNDED).toBe('REFUNDED');
      expect(PaymentStatus.PARTIALLY_REFUNDED).toBe('PARTIALLY_REFUNDED');
    });
  });

  describe('HousekeepingStatus', () => {
    it('should have all housekeeping statuses', () => {
      expect(HousekeepingStatus.PENDING).toBe('PENDING');
      expect(HousekeepingStatus.ASSIGNED).toBe('ASSIGNED');
      expect(HousekeepingStatus.IN_PROGRESS).toBe('IN_PROGRESS');
      expect(HousekeepingStatus.COMPLETED).toBe('COMPLETED');
      expect(HousekeepingStatus.INSPECTED).toBe('INSPECTED');
    });
  });

  describe('OrderStatus', () => {
    it('should have all order statuses', () => {
      expect(OrderStatus.PLACED).toBe('PLACED');
      expect(OrderStatus.PREPARING).toBe('PREPARING');
      expect(OrderStatus.READY).toBe('READY');
      expect(OrderStatus.SERVED).toBe('SERVED');
      expect(OrderStatus.COMPLETED).toBe('COMPLETED');
      expect(OrderStatus.CANCELLED).toBe('CANCELLED');
    });
  });

  describe('InvoiceStatus', () => {
    it('should have all invoice statuses', () => {
      expect(InvoiceStatus.DRAFT).toBe('DRAFT');
      expect(InvoiceStatus.FINAL).toBe('FINAL');
      expect(InvoiceStatus.PAID).toBe('PAID');
      expect(InvoiceStatus.PARTIALLY_PAID).toBe('PARTIALLY_PAID');
      expect(InvoiceStatus.VOID).toBe('VOID');
    });
  });
});
