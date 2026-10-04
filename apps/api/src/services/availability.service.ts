import { Op } from 'sequelize';
import { getSequelize } from '../config/database';
import { Room } from '../models/room.model';
import { RoomType } from '../models/room-type.model';
import { Reservation } from '../models/reservation.model';
import { ReservationRoom } from '../models/reservation-room.model';
import { Stay } from '../models/stay.model';

export interface AvailabilityQuery {
  property_id: string;
  check_in_date: string;
  check_out_date: string;
  room_type_id?: string;
  adults?: number;
}

export class AvailabilityService {
  async getRoomTypeAvailability(query: AvailabilityQuery): Promise<any[]> {
    const sequelize = getSequelize();

    const roomTypes = await RoomType.findAll({
      where: { property_id: query.property_id, is_active: true },
    });

    const results = [];

    for (const roomType of roomTypes) {
      const totalRooms = await Room.count({
        where: {
          property_id: query.property_id,
          room_type_id: roomType.id,
          is_active: true,
        },
      });

      const bookedRooms = await sequelize.query(
        `
        SELECT COUNT(DISTINCT r.id) as booked_count
        FROM rooms r
        INNER JOIN reservation_rooms rr ON rr.room_id = r.id
        INNER JOIN reservations res ON res.id = rr.reservation_id
        WHERE r.property_id = :propertyId
          AND r.room_type_id = :roomTypeId
          AND res.status NOT IN ('CANCELLED', 'NO_SHOW')
          AND rr.check_in_date < :check_out_date
          AND rr.check_out_date > :check_in_date
        `,
        {
          replacements: {
            propertyId: query.property_id,
            roomTypeId: roomType.id,
            check_in_date: query.check_in_date,
            check_out_date: query.check_out_date,
          },
          type: 'SELECT' as any,
        }
      );

      const occupiedRooms = await sequelize.query(
        `
        SELECT COUNT(DISTINCT s.room_id) as occupied_count
        FROM stays s
        WHERE s.property_id = :propertyId
          AND s.status = 'ACTIVE'
          AND s.check_in_date < :check_out_date
          AND s.check_out_date > :check_in_date
        `,
        {
          replacements: {
            propertyId: query.property_id,
            check_in_date: query.check_in_date,
            check_out_date: query.check_out_date,
          },
          type: 'SELECT' as any,
        }
      );

      const oooRooms = await Room.count({
        where: {
          property_id: query.property_id,
          room_type_id: roomType.id,
          status: { [Op.in]: ['OUT_OF_ORDER', 'MAINTENANCE'] },
        },
      });

      const booked = (bookedRooms[0] as any)?.booked_count || 0;
      const occupied = (occupiedRooms[0] as any)?.occupied_count || 0;
      const available = totalRooms - booked - occupied - oooRooms;

      results.push({
        room_type_id: roomType.id,
        room_type_name: roomType.name,
        room_type_code: roomType.code,
        total_rooms: totalRooms,
        booked_rooms: booked,
        occupied_rooms: occupied,
        out_of_order_rooms: oooRooms,
        available_rooms: Math.max(0, available),
        base_rate: roomType.base_rate,
        is_available: available > 0,
      });
    }

    return results;
  }

  async getRoomAvailabilityForDates(
    propertyId: string,
    startDate: string,
    endDate: string
  ): Promise<any[]> {
    const sequelize = getSequelize();

    // Get all rooms
    const rooms = await Room.findAll({
      where: { property_id: propertyId, is_active: true },
      include: [{ model: RoomType, as: 'roomType', attributes: ['id', 'name', 'code'] }],
      order: [['number', 'ASC']],
    });

    // Get all reservations for the date range
    const reservations = await sequelize.query(
      `
      SELECT rr.room_id, rr.check_in_date, rr.check_out_date, res.status as reservation_status
      FROM reservation_rooms rr
      INNER JOIN reservations res ON res.id = rr.reservation_id
      WHERE res.property_id = :propertyId
        AND res.status NOT IN ('CANCELLED', 'NO_SHOW')
        AND rr.check_in_date < :endDate
        AND rr.check_out_date > :startDate
        AND rr.room_id IS NOT NULL
      `,
      {
        replacements: { propertyId, startDate, endDate },
        type: 'SELECT' as any,
      }
    );

    // Get active stays
    const stays = await sequelize.query(
      `
      SELECT room_id, check_in_date, check_out_date
      FROM stays
      WHERE property_id = :propertyId
        AND status = 'ACTIVE'
        AND check_in_date < :endDate
        AND check_out_date > :startDate
      `,
      {
        replacements: { propertyId, startDate, endDate },
        type: 'SELECT' as any,
      }
    );

    return rooms.map((room) => {
      const reservationsForRoom = (reservations as any[]).filter((r) => r.room_id === room.id);
      const staysForRoom = (stays as any[]).filter((s) => s.room_id === room.id);
      const isBooked = reservationsForRoom.some((r) => r.reservation_status !== 'CANCELLED');
      const isOccupied = staysForRoom.length > 0;

      return {
        room_id: room.id,
        room_number: room.number,
        room_type: (room as any).roomType,
        status: room.status,
        is_booked: isBooked,
        is_occupied: isOccupied,
        is_available: !isBooked && !isOccupied && !['OUT_OF_ORDER', 'MAINTENANCE'].includes(room.status),
        reservations: reservationsForRoom,
        stays: staysForRoom,
      };
    });
  }

  async getOccupancyData(propertyId: string, date?: string): Promise<any> {
    const checkDate = date || new Date().toISOString().split('T')[0];

    const totalRooms = await Room.count({
      where: { property_id: propertyId, is_active: true },
    });

    const occupiedRooms = await Stay.count({
      where: {
        property_id: propertyId,
        status: 'ACTIVE',
        check_in_date: { [Op.lte]: checkDate },
        check_out_date: { [Op.gt]: checkDate },
      },
    });

    const outOfOrderRooms = await Room.count({
      where: {
        property_id: propertyId,
        is_active: true,
        status: { [Op.in]: ['OUT_OF_ORDER', 'MAINTENANCE'] },
      },
    });

    const availableRooms = totalRooms - occupiedRooms - outOfOrderRooms;

    return {
      date: checkDate,
      total_rooms: totalRooms,
      occupied_rooms: occupiedRooms,
      available_rooms: Math.max(0, availableRooms),
      out_of_order_rooms: outOfOrderRooms,
      occupancy_rate: totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0,
    };
  }
}

export const availabilityService = new AvailabilityService();
