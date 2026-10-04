import { getSequelize } from '../config/database';
import { Order } from '../models/order.model';
import { OrderItem } from '../models/order-item.model';
import { Kot } from '../models/kot.model';
import { MenuItem } from '../models/menu-item.model';
import { Restaurant } from '../models/restaurant.model';
import { Table } from '../models/table.model';
import { Stay } from '../models/stay.model';
import { Folio } from '../models/folio.model';
import { FolioItem } from '../models/folio-item.model';
import { NotFoundError, BusinessRuleError } from '../errors/app-error';
import { generateOrderNumber, generateKotNumber } from '../utils/index';
import { broadcastToProperty } from '../config/websocket';
import { AuditLog } from '../models/audit-log.model';

export interface CreateOrderInput {
  restaurant_id: string;
  table_id?: string;
  stay_id?: string;
  room_number?: string;
  order_type: string;
  guest_count: number;
  items: {
    menu_item_id: string;
    quantity: number;
    special_instructions?: string;
    modifiers?: any[];
  }[];
  notes?: string;
}

export class PosService {
  async findById(id: string): Promise<Order> {
    const order = await Order.findByPk(id, {
      include: [
        { model: OrderItem, as: 'items' },
        { model: Restaurant, as: 'restaurant', attributes: ['id', 'name'] },
        { model: Table, as: 'table', attributes: ['id', 'number'] },
        { model: Kot, as: 'kot' },
      ],
    });
    if (!order) throw new NotFoundError('Order', id);
    return order;
  }

  async findAll(propertyId: string, filters: any, page: number = 1, limit: number = 20) {
    const { Op } = require('sequelize');
    const where: any = { property_id: propertyId };
    if (filters.status) where.status = filters.status;
    if (filters.restaurant_id) where.restaurant_id = filters.restaurant_id;
    if (filters.order_type) where.order_type = filters.order_type;

    const { count, rows } = await Order.findAndCountAll({
      where,
      include: [
        { model: Restaurant, as: 'restaurant', attributes: ['id', 'name'] },
        { model: Table, as: 'table', attributes: ['id', 'number'] },
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset: (page - 1) * limit,
    });

    return { orders: rows, total: count };
  }

  async createOrder(input: CreateOrderInput, userId: string): Promise<Order> {
    const sequelize = getSequelize();
    const transaction = await sequelize.transaction();

    try {
      // Validate restaurant
      const restaurant = await Restaurant.findByPk(input.restaurant_id, { transaction });
      if (!restaurant) throw new NotFoundError('Restaurant', input.restaurant_id);

      // Validate and calculate items
      let subtotal = 0;
      const orderItems = [];

      for (const item of input.items) {
        const menuItem = await MenuItem.findByPk(item.menu_item_id, { transaction });
        if (!menuItem) throw new NotFoundError('Menu item', item.menu_item_id);
        if (!menuItem.is_available) throw new BusinessRuleError(`Menu item '${menuItem.name}' is not available`);

        const amount = Number(menuItem.price) * item.quantity;
        subtotal += amount;

        orderItems.push({
          menu_item_id: item.menu_item_id,
          name: menuItem.name,
          quantity: item.quantity,
          unit_price: Number(menuItem.price),
          amount,
          tax_amount: 0,
          discount_amount: 0,
          modifiers: item.modifiers,
          special_instructions: item.special_instructions,
          status: 'PLACED',
        });
      }

      // Create order
      const order = await Order.create(
        {
          ...input,
          order_number: generateOrderNumber(),
          property_id: restaurant.property_id,
          organization_id: restaurant.organization_id,
          subtotal,
          total_amount: subtotal,
          ordered_by: userId,
        } as any,
        { transaction }
      );

      // Create order items
      for (const item of orderItems) {
        await OrderItem.create(
          { ...item, order_id: order.id } as any,
          { transaction }
        );
      }

      // Create KOT
      await Kot.create(
        {
          order_id: order.id,
          kot_number: generateKotNumber(),
          property_id: restaurant.property_id,
          organization_id: restaurant.organization_id,
          status: 'PRINTED',
          priority: 'NORMAL',
          printed_at: new Date(),
        } as any,
        { transaction }
      );

      // Update table status if dine-in
      if (input.table_id && input.order_type === 'DINE_IN') {
        const table = await Table.findByPk(input.table_id, { transaction });
        if (table) {
          await table.update({ status: 'OCCUPIED' }, { transaction });
        }
      }

      await transaction.commit();

      // Audit
      await AuditLog.create({
        user_id: userId,
        organization_id: restaurant.organization_id,
        property_id: restaurant.property_id,
        action: 'CREATE',
        entity: 'ORDER',
        entity_id: order.id,
        new_value: { order_number: order.order_number, total: subtotal },
      } as any);

      broadcastToProperty(restaurant.property_id, 'order:created', {
        orderId: order.id,
        orderNumber: order.order_number,
      });

      return this.findById(order.id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async postToRoom(orderId: string, stayId: string, userId: string): Promise<FolioItem> {
    const sequelize = getSequelize();
    const transaction = await sequelize.transaction();

    try {
      const order = await Order.findByPk(orderId, { transaction });
      if (!order) throw new NotFoundError('Order', orderId);
      if (order.stay_id) throw new BusinessRuleError('Order already posted to a room');

      const stay = await Stay.findByPk(stayId, { transaction });
      if (!stay) throw new NotFoundError('Stay', stayId);
      if (stay.status !== 'ACTIVE') throw new BusinessRuleError('Stay is not active');

      const folio = await Folio.findOne({
        where: { stay_id: stayId, status: 'OPEN' },
        transaction,
      });
      if (!folio) throw new NotFoundError('Open folio for stay');

      // Add folio item
      const folioItem = await FolioItem.create(
        {
          folio_id: folio.id,
          description: `POS Order #${order.order_number}`,
          category: 'POS',
          quantity: 1,
          unit_price: Number(order.total_amount),
          amount: Number(order.total_amount),
          tax_amount: Number(order.tax_amount),
          discount_amount: Number(order.discount_amount),
          net_amount: Number(order.total_amount) - Number(order.discount_amount) + Number(order.tax_amount),
          reference_type: 'ORDER',
          reference_id: order.id,
          posted_by: userId,
          posted_at: new Date(),
        } as any,
        { transaction }
      );

      // Update order with stay_id
      await order.update({ stay_id: stayId } as any, { transaction });

      // Update folio balance
      const newCharges = Number(folio.total_charges) + Number(order.total_amount);
      const newBalance = newCharges + Number(folio.total_taxes) - Number(folio.total_discounts)
        - Number(folio.total_payments) + Number(folio.total_refunds);
      await folio.update({ total_charges: newCharges, balance: newBalance }, { transaction });

      await transaction.commit();

      broadcastToProperty(stay.property_id, 'order:posted_to_room', {
        orderId: order.id,
        stayId,
        amount: order.total_amount,
      });

      return folioItem;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

export const posService = new PosService();
