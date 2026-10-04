import { Op } from 'sequelize';
import { getSequelize } from '../config/database';
import { Reservation } from '../models/reservation.model';
import { ReservationRoom } from '../models/reservation-room.model';
import { ReservationGuest } from '../models/reservation-guest.model';
import { Room } from '../models/room.model';
import { Guest } from '../models/guest.model';
import { RoomType } from '../models/room-type.model';
import { acquireLock, releaseLock } from '../config/redis';
import {
  NotFoundError,
  BusinessRuleError,
  ConflictError,
  ValidationError,
} from '../errors/app-error';
import { RESERVATION_STATUS_TRANSITIONS } from '../constants/index';
import { generateInvoiceNumber } from '../utils/index';
import { broadcastToProperty } from '../config/websocket';
import { AuditLog } from '../models/audit-log.model';

export interface CreateReservationInput {
  property_id: string;
  organization_id: string;
  check_in_date: string;
  check_out_date: string;
  adults: number;
  children?: number;
  rooms_count?: number;
  source?: string;
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
}

export class ReservationService {
  async findById(id: string): Promise<Reservation> {
    const reservation = await Reservation.findByPk(id, {
      include: [
        {
          model: ReservationRoom,
          as: 'rooms',
          include: [
            { model: Room, as: 'room', attributes: ['id', 'number', 'status'] },
            { model: RoomType, as: 'roomType', attributes: ['id', 'name', 'code'] },
          ],
        },
        {
          model: ReservationGuest,
          as: 'guests',
          include: [{ model: Guest, as: 'guest' }],
        },
      ],
    });
    if (!reservation) {
      throw new NotFoundError('Reservation', id);
    }
    return reservation;
  }

  async findAll(propertyId: string, filters: any, page: number = 1, limit: number = 20) {
    const where: any = { property_id: propertyId };
    if (filters.status) where.status = filters.status;
    if (filters.check_in_date) where.check_in_date = filters.check_in_date;
    if (filters.check_out_date) where.check_out_date = filters.check_out_date;
    if (filters.source) where.source = filters.source;
    if (filters.confirmation_number) {
      where.confirmation_number = { [Op.iLike]: `%${filters.confirmation_number}%` };
    }

    const { count, rows } = await Reservation.findAndCountAll({
      where,
      include: [
        {
          model: ReservationRoom,
          as: 'rooms',
          include: [{ model: Room, as: 'room', attributes: ['id', 'number'] }],
        },
        {
          model: ReservationGuest,
          as: 'guests',
          include: [{ model: Guest, as: 'guest', attributes: ['id', 'first_name', 'last_name', 'email'] }],
        },
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset: (page - 1) * limit,
    });

    return { reservations: rows, total: count };
  }

  async create(input: CreateReservationInput, userId: string): Promise<Reservation> {
    const lockKey = `reservation:create:${input.property_id}:${input.room_type_id}:${input.check_in_date}`;
    const lockToken = await acquireLock(lockKey, 10000);

    if (!lockToken) {
      throw new BusinessRuleError('System is busy. Please try again in a moment.');
    }

    const sequelize = getSequelize();
    const transaction = await sequelize.transaction();

    try {
      // Check room availability within transaction using SELECT FOR UPDATE
      const availableRooms = await sequelize.query(
        `
        SELECT r.id
        FROM rooms r
        WHERE r.property_id = :propertyId
          AND r.room_type_id = :roomTypeId
          AND r.is_active = true
          AND r.status NOT IN ('OUT_OF_ORDER', 'MAINTENANCE')
          AND r.id NOT IN (
            SELECT rr.room_id
            FROM reservation_rooms rr
            INNER JOIN reservations res ON res.id = rr.reservation_id
            WHERE res.property_id = :propertyId
              AND res.room_type_id = :roomTypeId
              AND res.status NOT IN ('CANCELLED', 'NO_SHOW')
              AND rr.room_id IS NOT NULL
              AND (
                (rr.check_in_date < :check_out_date AND rr.check_out_date > :check_in_date)
              )
            UNION ALL
            SELECT s.room_id
            FROM stays s
            WHERE s.property_id = :propertyId
              AND s.status = 'ACTIVE'
              AND (
                (s.check_in_date < :check_out_date AND s.check_out_date > :check_in_date)
              )
          )
        LIMIT 1
        FOR UPDATE OF r
        `,
        {
          replacements: {
            propertyId: input.property_id,
            roomTypeId: input.room_type_id,
            check_in_date: input.check_in_date,
            check_out_date: input.check_out_date,
          },
          type: 'SELECT' as any,
          transaction,
        }
      );

      const rooms = availableRooms as any[];
      if (!rooms || rooms.length === 0) {
        await transaction.rollback();
        throw new ConflictError('No rooms available for the selected dates and room type');
      }

      // Generate confirmation number
      const confirmationNumber = this.generateConfirmationNumber();

      // Get or create guest
      let guest = await Guest.findOne({
        where: {
          property_id: input.property_id,
          [Op.or]: [
            ...(input.guest.email ? [{ email: input.guest.email }] : []),
            ...(input.guest.phone ? [{ phone: input.guest.phone }] : []),
          ],
        },
        transaction,
      });

      if (!guest) {
        guest = await Guest.create(
          {
            ...input.guest,
            property_id: input.property_id,
            organization_id: input.organization_id,
          } as any,
          { transaction }
        );
      }

      // Calculate amounts
      const roomType = await RoomType.findByPk(input.room_type_id, { transaction });
      if (!roomType) {
        throw new NotFoundError('Room Type', input.room_type_id);
      }

      const nights = this.calculateNights(input.check_in_date, input.check_out_date);
      const ratePerNight = Number(roomType.base_rate);
      const totalAmount = ratePerNight * nights * (input.rooms_count || 1);

      // Create reservation
      const reservation = await Reservation.create(
        {
          ...input,
          confirmation_number: confirmationNumber,
          status: 'CONFIRMED',
          rooms_count: input.rooms_count || 1,
          total_amount: totalAmount,
          advance_paid: input.advance_paid || 0,
          net_amount: totalAmount,
          created_by: userId,
        } as any,
        { transaction }
      );

      // Create reservation room
      await ReservationRoom.create(
        {
          reservation_id: reservation.id,
          room_type_id: input.room_type_id,
          rate: totalAmount,
          rate_per_night: ratePerNight,
          nights,
          check_in_date: input.check_in_date,
          check_out_date: input.check_out_date,
          adults: input.adults,
          children: input.children || 0,
          status: 'PENDING',
        } as any,
        { transaction }
      );

      // Create reservation guest
      await ReservationGuest.create(
        {
          reservation_id: reservation.id,
          guest_id: guest.id,
          is_primary: true,
        } as any,
        { transaction }
      );

      await transaction.commit();

      // Audit log
      await AuditLog.create({
        user_id: userId,
        organization_id: input.organization_id,
        property_id: input.property_id,
        action: 'CREATE',
        entity: 'RESERVATION',
        entity_id: reservation.id,
        new_value: { confirmation_number: confirmationNumber, status: 'CONFIRMED' },
      } as any);

      // Broadcast
      broadcastToProperty(input.property_id, 'reservation:created', {
        reservationId: reservation.id,
        confirmationNumber,
      });

      return this.findById(reservation.id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    } finally {
      await releaseLock(lockKey, lockToken);
    }
  }

  async confirm(id: string, userId: string): Promise<Reservation> {
    const reservation = await this.validateStatusTransition(id, 'CONFIRMED');

    await reservation.update({
      status: 'CONFIRMED',
      updated_by: userId,
    } as any);

    broadcastToProperty(reservation.property_id, 'reservation:confirmed', {
      reservationId: reservation.id,
      confirmationNumber: reservation.confirmation_number,
    });

    return this.findById(id);
  }

  async cancel(id: string, userId: string, reason?: string): Promise<Reservation> {
    const reservation = await this.validateStatusTransition(id, 'CANCELLED');
    const sequelize = getSequelize();
    const transaction = await sequelize.transaction();

    try {
      await reservation.update({
        status: 'CANCELLED',
        cancelled_at: new Date(),
        cancelled_by: userId,
        cancellation_reason: reason,
        updated_by: userId,
      } as any, { transaction });

      // Cancel all reservation rooms
      await ReservationRoom.update(
        { status: 'CANCELLED' },
        { where: { reservation_id: id }, transaction }
      );

      await transaction.commit();

      broadcastToProperty(reservation.property_id, 'reservation:cancelled', {
        reservationId: reservation.id,
      });

      return this.findById(id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async noShow(id: string, userId: string): Promise<Reservation> {
    const reservation = await this.validateStatusTransition(id, 'NO_SHOW');

    await reservation.update({
      status: 'NO_SHOW',
      no_show_at: new Date(),
      updated_by: userId,
    } as any);

    broadcastToProperty(reservation.property_id, 'reservation:no_show', {
      reservationId: reservation.id,
    });

    return this.findById(id);
  }

  async update(id: string, data: any, userId: string): Promise<Reservation> {
    const reservation = await this.findById(id);

    if (!['INQUIRY', 'TENTATIVE', 'CONFIRMED'].includes(reservation.status)) {
      throw new BusinessRuleError('Cannot update reservation in current status');
    }

    await reservation.update({ ...data, updated_by: userId } as any);

    return this.findById(id);
  }

  private async validateStatusTransition(id: string, targetStatus: string): Promise<Reservation> {
    const reservation = await this.findById(id);
    const allowedTransitions = RESERVATION_STATUS_TRANSITIONS[reservation.status];

    if (!allowedTransitions || !allowedTransitions.includes(targetStatus)) {
      throw new BusinessRuleError(
        `Cannot transition from '${reservation.status}' to '${targetStatus}'`
      );
    }

    return reservation;
  }

  private calculateNights(checkIn: string, checkOut: string): number {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }

  private generateConfirmationNumber(): string {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `RES${year}${month}${random}`;
  }
}

export const reservationService = new ReservationService();
