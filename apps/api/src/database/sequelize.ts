import { DataTypes, Model, ModelStatic } from 'sequelize';
import { getSequelize } from '../config/database';
import { logger } from '../config/logger';

// Import all models
import { Organization } from '../models/organization.model';
import { Property } from '../models/property.model';
import { Floor } from '../models/floor.model';
import { RoomType } from '../models/room-type.model';
import { Room } from '../models/room.model';
import { RoomAmenity } from '../models/room-amenity.model';
import { RoomStatusHistory } from '../models/room-status-history.model';
import { User } from '../models/user.model';
import { Role } from '../models/role.model';
import { Permission } from '../models/permission.model';
import { UserRole } from '../models/user-role.model';
import { RolePermission } from '../models/role-permission.model';
import { Guest } from '../models/guest.model';
import { GuestDocument } from '../models/guest-document.model';
import { GuestPreference } from '../models/guest-preference.model';
import { Reservation } from '../models/reservation.model';
import { ReservationRoom } from '../models/reservation-room.model';
import { ReservationGuest } from '../models/reservation-guest.model';
import { Stay } from '../models/stay.model';
import { StayGuest } from '../models/stay-guest.model';
import { Folio } from '../models/folio.model';
import { FolioItem } from '../models/folio-item.model';
import { Payment } from '../models/payment.model';
import { Refund } from '../models/refund.model';
import { Invoice } from '../models/invoice.model';
import { HousekeepingTask } from '../models/housekeeping-task.model';
import { MaintenanceTicket } from '../models/maintenance-ticket.model';
import { Outlet } from '../models/outlet.model';
import { Restaurant } from '../models/restaurant.model';
import { Table } from '../models/table.model';
import { MenuCategory } from '../models/menu-category.model';
import { MenuItem } from '../models/menu-item.model';
import { MenuModifier } from '../models/menu-modifier.model';
import { Order } from '../models/order.model';
import { OrderItem } from '../models/order-item.model';
import { Kot } from '../models/kot.model';
import { InventoryCategory } from '../models/inventory-category.model';
import { InventoryItem } from '../models/inventory-item.model';
import { Unit } from '../models/unit.model';
import { Vendor } from '../models/vendor.model';
import { PurchaseOrder } from '../models/purchase-order.model';
import { PurchaseOrderItem } from '../models/purchase-order-item.model';
import { GoodsReceipt } from '../models/goods-receipt.model';
import { GoodsReceiptItem } from '../models/goods-receipt-item.model';
import { StockTransaction } from '../models/stock-transaction.model';
import { BanquetHall } from '../models/banquet-hall.model';
import { BanquetEvent } from '../models/banquet-event.model';
import { EventPackage } from '../models/event-package.model';
import { EventItem } from '../models/event-item.model';
import { MembershipPlan } from '../models/membership-plan.model';
import { Member } from '../models/member.model';
import { LoyaltyTransaction } from '../models/loyalty-transaction.model';
import { Tax } from '../models/tax.model';
import { Discount } from '../models/discount.model';
import { Notification } from '../models/notification.model';
import { AuditLog } from '../models/audit-log.model';
import { RefreshToken } from '../models/refresh-token.model';

export function initializeModels(): void {
  const sequelize = getSequelize();

  // Register all models
  const models = [
    Organization, Property, Floor, RoomType, Room, RoomAmenity, RoomStatusHistory,
    User, Role, Permission, UserRole, RolePermission,
    Guest, GuestDocument, GuestPreference,
    Reservation, ReservationRoom, ReservationGuest,
    Stay, StayGuest,
    Folio, FolioItem,
    Payment, Refund, Invoice,
    HousekeepingTask, MaintenanceTicket,
    Outlet, Restaurant, Table, MenuCategory, MenuItem, MenuModifier,
    Order, OrderItem, Kot,
    InventoryCategory, InventoryItem, Unit, Vendor,
    PurchaseOrder, PurchaseOrderItem, GoodsReceipt, GoodsReceiptItem, StockTransaction,
    BanquetHall, BanquetEvent, EventPackage, EventItem,
    MembershipPlan, Member, LoyaltyTransaction,
    Tax, Discount,
    Notification, AuditLog, RefreshToken,
  ];

  models.forEach((model) => {
    model.initialize(sequelize);
  });

  // Set up associations
  models.forEach((model) => {
    if (model.associate) {
      model.associate();
    }
  });

  logger.info(`Initialized ${models.length} models`);
}

export {
  Organization, Property, Floor, RoomType, Room, RoomAmenity, RoomStatusHistory,
  User, Role, Permission, UserRole, RolePermission,
  Guest, GuestDocument, GuestPreference,
  Reservation, ReservationRoom, ReservationGuest,
  Stay, StayGuest,
  Folio, FolioItem,
  Payment, Refund, Invoice,
  HousekeepingTask, MaintenanceTicket,
  Outlet, Restaurant, Table, MenuCategory, MenuItem, MenuModifier,
  Order, OrderItem, Kot,
  InventoryCategory, InventoryItem, Unit, Vendor,
  PurchaseOrder, PurchaseOrderItem, GoodsReceipt, GoodsReceiptItem, StockTransaction,
  BanquetHall, BanquetEvent, EventPackage, EventItem,
  MembershipPlan, Member, LoyaltyTransaction,
  Tax, Discount,
  Notification, AuditLog, RefreshToken,
};
