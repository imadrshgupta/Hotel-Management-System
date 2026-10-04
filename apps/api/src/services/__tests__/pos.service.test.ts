// Mock all dependencies before importing
jest.mock('../../config/database', () => ({
  getSequelize: jest.fn(),
}));

jest.mock('../../config/websocket', () => ({
  broadcastToProperty: jest.fn(),
}));

jest.mock('../../models/order.model', () => ({
  Order: {
    findByPk: jest.fn(),
    findAndCountAll: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock('../../models/order-item.model', () => ({
  OrderItem: {
    create: jest.fn(),
  },
}));

jest.mock('../../models/menu-item.model', () => ({
  MenuItem: {
    findByPk: jest.fn(),
  },
}));

jest.mock('../../models/restaurant.model', () => ({
  Restaurant: {
    findByPk: jest.fn(),
  },
}));

jest.mock('../../models/table.model', () => ({
  Table: {
    findByPk: jest.fn(),
  },
}));

jest.mock('../../models/kot.model', () => ({
  Kot: {
    create: jest.fn(),
  },
}));

jest.mock('../../models/stay.model', () => ({
  Stay: {
    findByPk: jest.fn(),
  },
}));

jest.mock('../../models/folio.model', () => ({
  Folio: {
    findOne: jest.fn(),
    findByPk: jest.fn(),
  },
}));

jest.mock('../../models/folio-item.model', () => ({
  FolioItem: {
    create: jest.fn(),
  },
}));

jest.mock('../../models/audit-log.model', () => ({
  AuditLog: {
    create: jest.fn(),
  },
}));

import { PosService, posService } from '../pos.service';
import { Order } from '../../models/order.model';
import { OrderItem } from '../../models/order-item.model';
import { MenuItem } from '../../models/menu-item.model';
import { Restaurant } from '../../models/restaurant.model';
import { Kot } from '../../models/kot.model';
import { Table } from '../../models/table.model';
import { Stay } from '../../models/stay.model';
import { Folio } from '../../models/folio.model';
import { FolioItem } from '../../models/folio-item.model';
import { getSequelize } from '../../config/database';
import { broadcastToProperty } from '../../config/websocket';
import { AuditLog } from '../../models/audit-log.model';

describe('PosService', () => {
  let service: PosService;

  beforeEach(() => {
    service = new PosService();
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should return an order by id', async () => {
      const mockOrder = { id: 'order-1', order_number: 'ORD2401ABC' };
      (Order.findByPk as jest.Mock).mockResolvedValue(mockOrder);

      const result = await service.findById('order-1');

      expect(result).toEqual(mockOrder);
      expect(Order.findByPk).toHaveBeenCalledWith('order-1', {
        include: expect.any(Array),
      });
    });

    it('should throw NotFoundError when order not found', async () => {
      (Order.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow('not found');
    });
  });

  describe('findAll', () => {
    it('should return paginated orders', async () => {
      const mockResult = {
        rows: [{ id: 'order-1' }],
        count: 1,
      };
      (Order.findAndCountAll as jest.Mock).mockResolvedValue(mockResult);

      const result = await service.findAll('prop-1', { status: 'PLACED' }, 1, 20);

      expect(result.orders).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('should apply filters', async () => {
      (Order.findAndCountAll as jest.Mock).mockResolvedValue({ rows: [], count: 0 });

      await service.findAll('prop-1', {
        status: 'PLACED',
        restaurant_id: 'rest-1',
        order_type: 'DINE_IN',
      });

      expect(Order.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            property_id: 'prop-1',
            status: 'PLACED',
            restaurant_id: 'rest-1',
            order_type: 'DINE_IN',
          }),
        })
      );
    });
  });

  describe('createOrder', () => {
    it('should create an order with items and KOT', async () => {
      const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };
      const mockSequelize = { transaction: jest.fn().mockResolvedValue(mockTransaction) };
      (getSequelize as jest.Mock).mockReturnValue(mockSequelize);

      const mockRestaurant = {
        id: 'rest-1',
        property_id: 'prop-1',
        organization_id: 'org-1',
      };
      (Restaurant.findByPk as jest.Mock).mockResolvedValue(mockRestaurant);

      const mockMenuItem = {
        id: 'mi-1',
        name: 'Caesar Salad',
        price: 250,
        is_available: true,
      };
      (MenuItem.findByPk as jest.Mock).mockResolvedValue(mockMenuItem);

      const mockOrder = { id: 'order-1', order_number: 'ORD2401ABC' };
      (Order.create as jest.Mock).mockResolvedValue(mockOrder);
      (OrderItem.create as jest.Mock).mockResolvedValue({});
      (Kot.create as jest.Mock).mockResolvedValue({});

      const mockCreatedOrder = { id: 'order-1', order_number: 'ORD2401ABC' };
      (Order.findByPk as jest.Mock).mockResolvedValue(mockCreatedOrder);

      const input = {
        restaurant_id: 'rest-1',
        order_type: 'DINE_IN',
        guest_count: 2,
        items: [
          { menu_item_id: 'mi-1', quantity: 2 },
        ],
      };

      const result = await service.createOrder(input, 'user-1');

      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(OrderItem.create).toHaveBeenCalled();
      expect(Kot.create).toHaveBeenCalled();
      expect(AuditLog.create).toHaveBeenCalled();
      expect(broadcastToProperty).toHaveBeenCalled();
    });

    it('should update table status for dine-in orders', async () => {
      const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };
      const mockSequelize = { transaction: jest.fn().mockResolvedValue(mockTransaction) };
      (getSequelize as jest.Mock).mockReturnValue(mockSequelize);

      const mockRestaurant = {
        id: 'rest-1',
        property_id: 'prop-1',
        organization_id: 'org-1',
      };
      (Restaurant.findByPk as jest.Mock).mockResolvedValue(mockRestaurant);

      const mockMenuItem = {
        id: 'mi-1',
        name: 'Caesar Salad',
        price: 250,
        is_available: true,
      };
      (MenuItem.findByPk as jest.Mock).mockResolvedValue(mockMenuItem);

      const mockTable = { id: 'table-1', status: 'AVAILABLE', update: jest.fn() };
      (Table.findByPk as jest.Mock).mockResolvedValue(mockTable);

      const mockOrder = { id: 'order-1', order_number: 'ORD2401ABC' };
      (Order.create as jest.Mock).mockResolvedValue(mockOrder);
      (OrderItem.create as jest.Mock).mockResolvedValue({});
      (Kot.create as jest.Mock).mockResolvedValue({});
      (Order.findByPk as jest.Mock).mockResolvedValue(mockOrder);

      const input = {
        restaurant_id: 'rest-1',
        table_id: 'table-1',
        order_type: 'DINE_IN',
        guest_count: 2,
        items: [{ menu_item_id: 'mi-1', quantity: 1 }],
      };

      await service.createOrder(input, 'user-1');

      expect(mockTable.update).toHaveBeenCalledWith({ status: 'OCCUPIED' }, { transaction: mockTransaction });
    });

    it('should throw error when restaurant not found', async () => {
      const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };
      const mockSequelize = { transaction: jest.fn().mockResolvedValue(mockTransaction) };
      (getSequelize as jest.Mock).mockReturnValue(mockSequelize);

      (Restaurant.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(
        service.createOrder({
          restaurant_id: 'nonexistent',
          order_type: 'DINE_IN',
          guest_count: 1,
          items: [],
        }, 'user-1')
      ).rejects.toThrow('not found');

      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('should throw error when menu item not found', async () => {
      const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };
      const mockSequelize = { transaction: jest.fn().mockResolvedValue(mockTransaction) };
      (getSequelize as jest.Mock).mockReturnValue(mockSequelize);

      (Restaurant.findByPk as jest.Mock).mockResolvedValue({
        id: 'rest-1',
        property_id: 'prop-1',
        organization_id: 'org-1',
      });
      (MenuItem.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(
        service.createOrder({
          restaurant_id: 'rest-1',
          order_type: 'DINE_IN',
          guest_count: 1,
          items: [{ menu_item_id: 'nonexistent', quantity: 1 }],
        }, 'user-1')
      ).rejects.toThrow('not found');
    });

    it('should throw error when menu item is unavailable', async () => {
      const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };
      const mockSequelize = { transaction: jest.fn().mockResolvedValue(mockTransaction) };
      (getSequelize as jest.Mock).mockReturnValue(mockSequelize);

      (Restaurant.findByPk as jest.Mock).mockResolvedValue({
        id: 'rest-1',
        property_id: 'prop-1',
        organization_id: 'org-1',
      });
      (MenuItem.findByPk as jest.Mock).mockResolvedValue({
        id: 'mi-1',
        name: 'Caesar Salad',
        is_available: false,
      });

      await expect(
        service.createOrder({
          restaurant_id: 'rest-1',
          order_type: 'DINE_IN',
          guest_count: 1,
          items: [{ menu_item_id: 'mi-1', quantity: 1 }],
        }, 'user-1')
      ).rejects.toThrow('not available');
    });
  });

  describe('postToRoom', () => {
    it('should post order to room successfully', async () => {
      const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };
      const mockSequelize = { transaction: jest.fn().mockResolvedValue(mockTransaction) };
      (getSequelize as jest.Mock).mockReturnValue(mockSequelize);

      const mockOrder = {
        id: 'order-1',
        order_number: 'ORD2401ABC',
        total_amount: 500,
        tax_amount: 50,
        discount_amount: 0,
        stay_id: null,
        update: jest.fn(),
      };
      (Order.findByPk as jest.Mock).mockResolvedValue(mockOrder);

      const mockStay = {
        id: 'stay-1',
        status: 'ACTIVE',
        property_id: 'prop-1',
      };
      (Stay.findByPk as jest.Mock).mockResolvedValue(mockStay);

      const mockFolio = {
        id: 'folio-1',
        total_charges: 1000,
        total_taxes: 100,
        total_discounts: 0,
        total_payments: 500,
        total_refunds: 0,
        balance: 600,
        update: jest.fn(),
      };
      (Folio.findOne as jest.Mock).mockResolvedValue(mockFolio);

      const mockFolioItem = { id: 'fi-1' };
      (FolioItem.create as jest.Mock).mockResolvedValue(mockFolioItem);

      const result = await service.postToRoom('order-1', 'stay-1', 'user-1');

      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(mockOrder.update).toHaveBeenCalledWith({ stay_id: 'stay-1' }, { transaction: mockTransaction });
      expect(mockFolio.update).toHaveBeenCalled();
      expect(broadcastToProperty).toHaveBeenCalled();
      expect(result).toEqual(mockFolioItem);
    });

    it('should throw error when order not found', async () => {
      const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };
      const mockSequelize = { transaction: jest.fn().mockResolvedValue(mockTransaction) };
      (getSequelize as jest.Mock).mockReturnValue(mockSequelize);

      (Order.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(service.postToRoom('nonexistent', 'stay-1', 'user-1')).rejects.toThrow(
        'not found'
      );
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('should throw error when order already posted', async () => {
      const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };
      const mockSequelize = { transaction: jest.fn().mockResolvedValue(mockTransaction) };
      (getSequelize as jest.Mock).mockReturnValue(mockSequelize);

      (Order.findByPk as jest.Mock).mockResolvedValue({
        id: 'order-1',
        stay_id: 'existing-stay',
      });

      await expect(service.postToRoom('order-1', 'stay-1', 'user-1')).rejects.toThrow(
        'already posted'
      );
    });

    it('should throw error when stay not found', async () => {
      const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };
      const mockSequelize = { transaction: jest.fn().mockResolvedValue(mockTransaction) };
      (getSequelize as jest.Mock).mockReturnValue(mockSequelize);

      (Order.findByPk as jest.Mock).mockResolvedValue({
        id: 'order-1',
        stay_id: null,
      });
      (Stay.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(service.postToRoom('order-1', 'nonexistent', 'user-1')).rejects.toThrow(
        'not found'
      );
    });

    it('should throw error when stay is not active', async () => {
      const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };
      const mockSequelize = { transaction: jest.fn().mockResolvedValue(mockTransaction) };
      (getSequelize as jest.Mock).mockReturnValue(mockSequelize);

      (Order.findByPk as jest.Mock).mockResolvedValue({
        id: 'order-1',
        stay_id: null,
      });
      (Stay.findByPk as jest.Mock).mockResolvedValue({
        id: 'stay-1',
        status: 'CHECKED_OUT',
      });

      await expect(service.postToRoom('order-1', 'stay-1', 'user-1')).rejects.toThrow(
        'not active'
      );
    });

    it('should throw error when no open folio', async () => {
      const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };
      const mockSequelize = { transaction: jest.fn().mockResolvedValue(mockTransaction) };
      (getSequelize as jest.Mock).mockReturnValue(mockSequelize);

      (Order.findByPk as jest.Mock).mockResolvedValue({
        id: 'order-1',
        stay_id: null,
      });
      (Stay.findByPk as jest.Mock).mockResolvedValue({
        id: 'stay-1',
        status: 'ACTIVE',
      });
      (Folio.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.postToRoom('order-1', 'stay-1', 'user-1')).rejects.toThrow(
        'not found'
      );
    });
  });

  describe('singleton export', () => {
    it('should export a singleton instance', () => {
      expect(posService).toBeInstanceOf(PosService);
    });
  });
});
