import { Op } from 'sequelize';
import { getSequelize } from '../config/database';
import { Stay } from '../models/stay.model';
import { StayGuest } from '../models/stay-guest.model';
import { Reservation } from '../models/reservation.model';
import { ReservationRoom } from '../models/reservation-room.model';
import { Room } from '../models/room.model';
import { Guest } from '../models/guest.model';
import { Folio } from '../models/folio.model';
import { RoomStatusHistory } from '../models/room-status-history.model';
import { HousekeepingTask } from '../models/housekeeping-task.model';
import {
  NotFoundError,
  BusinessRuleError,
  ConflictError,
} from '../errors/app-error';
import { generateInvoiceNumber } from '../utils/index';
import { broadcastToProperty } from '../config/websocket';
import { ROOM_STATUS_TRANSITIONS } from '../constants/index';
import { AuditLog } from '../models/audit-log.model';

export interface CheckInInput {
  reservation_id: string;
  room_id: string;
  guest_id: string;
  actual_check_in?: string;
  notes?: string;
}

export interface CheckOutInput {
  stay_id: string;
  actual_check_out?: string;
  notes?: string;
}

export class StayService {
  async findById(id: string): Promise<Stay> {
    const stay = await Stay.findByPk(id, {
      include: [
        { model: Reservation, as: 'reservation' },
        { model: Room, as: 'room' },
        { model: Guest, as: 'guest' },
        { model: StayGuest, as: 'guests', include: [{ model: Guest, as: 'guest' }] },
        { model: Folio, as: 'folio' },
      ],
    });
    if (!stay) {
      throw new NotFoundError('Stay', id);
    }
    return stay;
  }

  async findAll(propertyId: string, filters: any, page: number = 1, limit: number = 20) {
    const where: any = { property_id: propertyId };
    if (filters.status) where.status = filters.status;
    if (filters.room_id) where.room_id = filters.room_id;

    const { count, rows } = await Stay.findAndCountAll({
      where,
      include: [
        { model: Room, as: 'room', attributes: ['id', 'number'] },
        { model: Guest, as: 'guest', attributes: ['id', 'first_name', 'last_name', 'email'] },
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset: (page - 1) * limit,
    });

    return { stays: rows, total: count };
  }

  async getActiveByProperty(propertyId: string): Promise<Stay[]> {
    return Stay.findAll({
      where: { property_id: propertyId, status: 'ACTIVE' },
      include: [
        { model: Room, as: 'room' },
        { model: Guest, as: 'guest' },
      ],
      order: [['check_in_date', 'DESC']],
    });
  }

  async checkIn(input: CheckInInput, userId: string): Promise<Stay> {
    const sequelize = getSequelize();
    const transaction = await sequelize.transaction();

    try {
      // 1. Validate reservation
      const reservation = await Reservation.findByPk(input.reservation_id, {
        transaction,
      });
      if (!reservation) {
        throw new NotFoundError('Reservation', input.reservation_id);
      }
      if (reservation.status !== 'CONFIRMED') {
        throw new BusinessRuleError(`Reservation must be CONFIRMED to check in. Current status: ${reservation.status}`);
      }

      // 2. Validate room
      const room = await Room.findByPk(input.room_id, { transaction });
      if (!room) {
        throw new NotFoundError('Room', input.room_id);
      }
      if (!['RESERVED', 'VACANT_CLEAN'].includes(room.status)) {
        throw new BusinessRuleError(`Room is not available for check-in. Current status: ${room.status}`);
      }

      // 3. Validate guest
      const guest = await Guest.findByPk(input.guest_id, { transaction });
      if (!guest) {
        throw new NotFoundError('Guest', input.guest_id);
      }

      // 4. Create stay
      const stay = await Stay.create(
        {
          reservation_id: input.reservation_id,
          room_id: input.room_id,
          guest_id: input.guest_id,
          property_id: reservation.property_id,
          organization_id: reservation.organization_id,
          check_in_date: reservation.check_in_date,
          check_out_date: reservation.check_out_date,
          actual_check_in: input.actual_check_in ? new Date(input.actual_check_in) : new Date(),
          status: 'ACTIVE',
          adults: reservation.adults,
          children: reservation.children,
          rate: Number(reservation.net_amount) / (this.calculateNights(reservation.check_in_date.toString(), reservation.check_out_date.toString())),
          notes: input.notes,
          created_by: userId,
        } as any,
        { transaction }
      );

      // 5. Add stay guest
      await StayGuest.create(
        {
          stay_id: stay.id,
          guest_id: input.guest_id,
          is_primary: true,
        } as any,
        { transaction }
      );

      // 6. Update room status to OCCUPIED
      const previousRoomStatus = room.status;
      await room.update({ status: 'OCCUPIED' }, { transaction });
      await RoomStatusHistory.create(
        {
          room_id: room.id,
          property_id: room.property_id,
          from_status: previousRoomStatus,
          to_status: 'OCCUPIED',
          changed_by: userId,
          reason: `Check-in for reservation ${reservation.confirmation_number}`,
        } as any,
        { transaction }
      );

      // 7. Update reservation status
      await reservation.update({ status: 'CHECKED_IN' }, { transaction });

      // 8. Update reservation room
      await ReservationRoom.update(
        { room_id: input.room_id, status: 'CHECKED_IN', assigned_at: new Date() },
        { where: { reservation_id: input.reservation_id }, transaction }
      );

      // 9. Create folio
      const folioNumber = generateInvoiceNumber('FOL');
      await Folio.create(
        {
          stay_id: stay.id,
          property_id: stay.property_id,
          organization_id: stay.organization_id,
          folio_number: folioNumber,
          status: 'OPEN',
          balance: 0,
        } as any,
        { transaction }
      );

      await transaction.commit();

      // Audit log
      await AuditLog.create({
        user_id: userId,
        organization_id: reservation.organization_id,
        property_id: reservation.property_id,
        action: 'CHECK_IN',
        entity: 'STAY',
        entity_id: stay.id,
        new_value: { room_id: input.room_id, guest_id: input.guest_id },
      } as any);

      // Broadcast
      broadcastToProperty(reservation.property_id, 'stay:checked_in', {
        stayId: stay.id,
        roomId: room.id,
        roomNumber: room.number,
      });

      return this.findById(stay.id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async checkOut(input: CheckOutInput, userId: string): Promise<Stay> {
    const sequelize = getSequelize();
    const transaction = await sequelize.transaction();

    try {
      const stay = await Stay.findByPk(input.stay_id, {
        include: [{ model: Room, as: 'room' }, { model: Folio, as: 'folio' }],
        transaction,
      });

      if (!stay) {
        throw new NotFoundError('Stay', input.stay_id);
      }
      if (stay.status !== 'ACTIVE') {
        throw new BusinessRuleError(`Stay is not active. Current status: ${stay.status}`);
      }

      const room = (stay as any).room;
      const folio = (stay as any).folio;

      // Update stay
      await stay.update({
        status: 'CHECKED_OUT',
        actual_check_out: input.actual_check_out ? new Date(input.actual_check_out) : new Date(),
        notes: input.notes || stay.notes,
        updated_by: userId,
      } as any, { transaction });

      // Update room status to DIRTY
      const previousRoomStatus = room.status;
      await room.update({ status: 'DIRTY' }, { transaction });
      await RoomStatusHistory.create(
        {
          room_id: room.id,
          property_id: room.property_id,
          from_status: previousRoomStatus,
          to_status: 'DIRTY',
          changed_by: userId,
          reason: 'Check-out',
        } as any,
        { transaction }
      );

      // Update reservation status
      await Reservation.update(
        { status: 'CHECKED_OUT' },
        { where: { id: stay.reservation_id }, transaction }
      );

      // Close folio if exists
      if (folio) {
        await folio.update({ status: 'CLOSED' }, { transaction });
      }

      // Create housekeeping task
      await HousekeepingTask.create(
        {
          room_id: room.id,
          property_id: room.property_id,
          organization_id: stay.organization_id,
          task_type: 'CHECKOUT',
          priority: 'MEDIUM',
          status: 'PENDING',
        } as any,
        { transaction }
      );

      await transaction.commit();

      // Audit log
      await AuditLog.create({
        user_id: userId,
        organization_id: stay.organization_id,
        property_id: stay.property_id,
        action: 'CHECK_OUT',
        entity: 'STAY',
        entity_id: stay.id,
        new_value: { room_status: 'DIRTY' },
      } as any);

      // Broadcast
      broadcastToProperty(stay.property_id, 'stay:checked_out', {
        stayId: stay.id,
        roomId: room.id,
        roomNumber: room.number,
      });

      return this.findById(stay.id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async extendStay(stayId: string, newCheckOutDate: string, userId: string): Promise<Stay> {
    const stay = await this.findById(stayId);
    if (stay.status !== 'ACTIVE') {
      throw new BusinessRuleError('Can only extend active stays');
    }

    const newDate = new Date(newCheckOutDate);
    if (newDate <= new Date(stay.check_out_date.toString())) {
      throw new BusinessRuleError('New check-out date must be after current check-out date');
    }

    await stay.update({
      check_out_date: newCheckOutDate,
      updated_by: userId,
    } as any);

    return this.findById(stayId);
  }

  private calculateNights(checkIn: string, checkOut: string): number {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }
}

export const stayService = new StayService();
