import { Op, fn, col, literal } from 'sequelize';
import { getSequelize } from '../config/database';
import { Reservation } from '../models/reservation.model';
import { Stay } from '../models/stay.model';
import { Room } from '../models/room.model';
import { Payment } from '../models/payment.model';
import { Invoice } from '../models/invoice.model';
import { Guest } from '../models/guest.model';
import { FolioItem } from '../models/folio-item.model';

export class ReportService {
  async getArrivals(propertyId: string, date: string): Promise<any[]> {
    return Reservation.findAll({
      where: {
        property_id: propertyId,
        check_in_date: date,
        status: { [Op.in]: ['CONFIRMED', 'CHECKED_IN'] },
      },
      include: [
        { model: Guest, as: 'guests', include: [{ model: Guest, as: 'guest', attributes: ['first_name', 'last_name', 'email', 'phone'] }] },
      ],
      order: [['created_at', 'ASC']],
    });
  }

  async getDepartures(propertyId: string, date: string): Promise<any[]> {
    return Stay.findAll({
      where: {
        property_id: propertyId,
        check_out_date: date,
        status: 'ACTIVE',
      },
      include: [
        { model: Guest, as: 'guest' },
        { model: Room, as: 'room', attributes: ['id', 'number'] },
      ],
    });
  }

  async getInHouseGuests(propertyId: string): Promise<any[]> {
    return Stay.findAll({
      where: { property_id: propertyId, status: 'ACTIVE' },
      include: [
        { model: Guest, as: 'guest' },
        { model: Room, as: 'room' },
      ],
      order: [['check_in_date', 'DESC']],
    });
  }

  async getRoomStatus(propertyId: string): Promise<any> {
    const rooms = await Room.findAll({
      where: { property_id: propertyId, is_active: true },
      attributes: ['status', [fn('COUNT', col('id')), 'count']],
      group: ['status'],
    });

    const summary: Record<string, number> = {};
    for (const r of rooms) {
      summary[r.status] = parseInt((r as any).dataValues.count, 10);
    }

    const total = Object.values(summary).reduce((a, b) => a + b, 0);

    return { summary, total };
  }

  async getDailyRevenue(propertyId: string, date: string): Promise<any> {
    const sequelize = getSequelize();

    const roomRevenue = await FolioItem.sum('net_amount', {
      where: {
        category: 'ROOM',
        posted_at: { [Op.between]: [`${date} 00:00:00`, `${date} 23:59:59`] },
        '$folio.property_id$': propertyId,
      },
      include: [{ model: (await import('../models/folio.model')).Folio, as: 'folio', attributes: [] }],
    } as any).catch(() => 0);

    const posRevenue = await FolioItem.sum('net_amount', {
      where: {
        category: 'POS',
        posted_at: { [Op.between]: [`${date} 00:00:00`, `${date} 23:59:59`] },
        '$folio.property_id$': propertyId,
      },
      include: [{ model: (await import('../models/folio.model')).Folio, as: 'folio', attributes: [] }],
    } as any).catch(() => 0);

    const totalPayments = await Payment.sum('amount', {
      where: {
        property_id: propertyId,
        status: 'COMPLETED',
        processed_at: { [Op.between]: [`${date} 00:00:00`, `${date} 23:59:59`] },
      },
    } as any).catch(() => 0);

    const totalRefunds = await Payment.sum('amount', {
      where: {
        property_id: propertyId,
        status: { [Op.in]: ['REFUNDED', 'PARTIALLY_REFUNDED'] },
        processed_at: { [Op.between]: [`${date} 00:00:00`, `${date} 23:59:59`] },
      },
    } as any).catch(() => 0);

    return {
      date,
      room_revenue: roomRevenue || 0,
      pos_revenue: posRevenue || 0,
      total_revenue: (roomRevenue || 0) + (posRevenue || 0),
      total_payments: totalPayments || 0,
      total_refunds: totalRefunds || 0,
    };
  }

  async getOccupancyReport(propertyId: string, startDate: string, endDate: string): Promise<any[]> {
    const sequelize = getSequelize();
    const results = [];

    const currentDate = new Date(startDate);
    const end = new Date(endDate);

    const totalRooms = await Room.count({
      where: { property_id: propertyId, is_active: true },
    });

    while (currentDate <= end) {
      const dateStr = currentDate.toISOString().split('T')[0];

      const occupied = await Stay.count({
        where: {
          property_id: propertyId,
          status: 'ACTIVE',
          check_in_date: { [Op.lte]: dateStr },
          check_out_date: { [Op.gt]: dateStr },
        },
      });

      results.push({
        date: dateStr,
        total_rooms: totalRooms,
        occupied: occupied,
        available: totalRooms - occupied,
        occupancy_rate: totalRooms > 0 ? Math.round((occupied / totalRooms) * 100) : 0,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return results;
  }

  async getPaymentsReport(propertyId: string, startDate: string, endDate: string): Promise<any> {
    const payments = await Payment.findAll({
      where: {
        property_id: propertyId,
        status: 'COMPLETED',
        processed_at: { [Op.between]: [startDate, endDate] },
      },
      attributes: [
        'method',
        [fn('SUM', col('amount')), 'total'],
        [fn('COUNT', col('id')), 'count'],
      ],
      group: ['method'],
    });

    return payments;
  }

  async getOutstandingReport(propertyId: string): Promise<any[]> {
    const { Folio } = await import('../models/folio.model');
    const { Stay } = await import('../models/stay.model');
    const { Guest } = await import('../models/guest.model');

    return Folio.findAll({
      where: {
        property_id: propertyId,
        status: 'OPEN',
      },
      include: [
        {
          model: Stay,
          as: 'stay',
          include: [{ model: Guest, as: 'guest', attributes: ['first_name', 'last_name', 'email'] }],
        },
      ],
      attributes: ['id', 'folio_number', 'balance'],
    } as any);
  }
}

export const reportService = new ReportService();
