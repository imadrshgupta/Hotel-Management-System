import { Op } from 'sequelize';
import { Room } from '../models/room.model';
import { RoomStatusHistory } from '../models/room-status-history.model';
import { getSequelize } from '../config/database';
import {
  NotFoundError,
  BusinessRuleError,
  ValidationError,
} from '../errors/app-error';
import { ROOM_STATUS_TRANSITIONS } from '../constants/index';
import { broadcastToProperty } from '../config/websocket';

export interface RoomFilter {
  property_id: string;
  status?: string;
  room_type_id?: string;
  floor_id?: string;
  is_active?: boolean;
  number?: string;
}

export interface ChangeRoomStatusInput {
  room_id: string;
  to_status: string;
  reason?: string;
  changed_by: string;
}

export class RoomService {
  async findById(id: string): Promise<Room> {
    const room = await Room.findByPk(id, {
      // @ts-ignore
      include: [
        { model: (await import('../models/room-type.model')).RoomType, as: 'roomType' },
        { model: (await import('../models/floor.model')).Floor, as: 'floor' },
      ],
    });
    if (!room) {
      throw new NotFoundError('Room', id);
    }
    return room;
  }

  async findAll(filter: RoomFilter, page: number = 1, limit: number = 20): Promise<{ rooms: Room[]; total: number }> {
    const where: any = { property_id: filter.property_id };
    if (filter.status) where.status = filter.status;
    if (filter.room_type_id) where.room_type_id = filter.room_type_id;
    if (filter.floor_id) where.floor_id = filter.floor_id;
    if (filter.is_active !== undefined) where.is_active = filter.is_active;
    if (filter.number) where.number = { [Op.iLike]: `%${filter.number}%` };

    const { count, rows } = await Room.findAndCountAll({
      where,
      include: [
        { model: (await import('../models/room-type.model')).RoomType, as: 'roomType', attributes: ['id', 'name', 'code'] },
        { model: (await import('../models/floor.model')).Floor, as: 'floor', attributes: ['id', 'name', 'code'] },
      ],
      order: [['number', 'ASC']],
      limit,
      offset: (page - 1) * limit,
    });

    return { rooms: rows, total: count };
  }

  async changeStatus(input: ChangeRoomStatusInput): Promise<Room> {
    const sequelize = getSequelize();
    const transaction = await sequelize.transaction();

    try {
      const room = await Room.findByPk(input.room_id, { transaction });
      if (!room) {
        throw new NotFoundError('Room', input.room_id);
      }

      const currentStatus = room.status;
      const allowedTransitions = ROOM_STATUS_TRANSITIONS[currentStatus];

      if (!allowedTransitions || !allowedTransitions.includes(input.to_status)) {
        throw new BusinessRuleError(
          `Invalid room status transition from '${currentStatus}' to '${input.to_status}'`
        );
      }

      // Update room status
      await room.update({ status: input.to_status }, { transaction });

      // Record status history
      await RoomStatusHistory.create(
        {
          room_id: input.room_id,
          property_id: room.property_id,
          from_status: currentStatus,
          to_status: input.to_status,
          changed_by: input.changed_by,
          reason: input.reason,
        } as any,
        { transaction }
      );

      await transaction.commit();

      // Broadcast room status change
      broadcastToProperty(room.property_id, 'room:status_changed', {
        roomId: room.id,
        roomNumber: room.number,
        fromStatus: currentStatus,
        toStatus: input.to_status,
      });

      return room.reload();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async create(data: any, userId: string): Promise<Room> {
    // Check for duplicate room number within property
    const existing = await Room.findOne({
      where: {
        property_id: data.property_id,
        number: data.number,
      },
    });

    if (existing) {
      throw new ValidationError(`Room number '${data.number}' already exists in this property`);
    }

    return Room.create({
      ...data,
      status: 'VACANT_CLEAN',
    } as any);
  }

  async update(id: string, data: any): Promise<Room> {
    const room = await Room.findByPk(id);
    if (!room) {
      throw new NotFoundError('Room', id);
    }

    // Don't allow changing status through update
    delete data.status;

    await room.update(data);
    return room.reload();
  }

  async delete(id: string): Promise<void> {
    const room = await Room.findByPk(id);
    if (!room) {
      throw new NotFoundError('Room', id);
    }

    // Cannot delete room with active stay or reservation
    if (room.status === 'OCCUPIED' || room.status === 'RESERVED') {
      throw new BusinessRuleError('Cannot delete room with active stay or reservation');
    }

    await room.destroy();
  }

  async getStatusSummary(propertyId: string): Promise<Record<string, number>> {
    const rooms = await Room.findAll({
      where: { property_id: propertyId, is_active: true },
      attributes: ['status'],
    });

    const summary: Record<string, number> = {};
    for (const room of rooms) {
      summary[room.status] = (summary[room.status] || 0) + 1;
    }
    return summary;
  }

  async getStatusHistory(roomId: string, limit: number = 50): Promise<RoomStatusHistory[]> {
    return RoomStatusHistory.findAll({
      where: { room_id: roomId },
      order: [['created_at', 'DESC']],
      limit,
    });
  }
}

export const roomService = new RoomService();
