// Mock all dependencies before importing
jest.mock('../../config/database', () => ({
  getSequelize: jest.fn(),
}));

jest.mock('../../models/room.model', () => ({
  Room: {
    findAll: jest.fn(),
    count: jest.fn(),
  },
}));

jest.mock('../../models/room-type.model', () => ({
  RoomType: {
    findAll: jest.fn(),
  },
}));

jest.mock('../../models/reservation.model', () => ({
  Reservation: {},
}));

jest.mock('../../models/reservation-room.model', () => ({
  ReservationRoom: {},
}));

jest.mock('../../models/stay.model', () => ({
  Stay: {
    count: jest.fn(),
  },
}));

import { AvailabilityService, availabilityService } from '../availability.service';
import { Room } from '../../models/room.model';
import { RoomType } from '../../models/room-type.model';
import { Stay } from '../../models/stay.model';
import { getSequelize } from '../../config/database';

describe('AvailabilityService', () => {
  let service: AvailabilityService;

  beforeEach(() => {
    service = new AvailabilityService();
    jest.clearAllMocks();
  });

  describe('getRoomTypeAvailability', () => {
    it('should return availability for all room types', async () => {
      const mockRoomTypes = [
        { id: 'rt-1', name: 'Deluxe', code: 'DLX', base_rate: 5000, is_active: true },
        { id: 'rt-2', name: 'Standard', code: 'STD', base_rate: 3000, is_active: true },
      ];
      (RoomType.findAll as jest.Mock).mockResolvedValue(mockRoomTypes);

      const mockSequelize = {
        query: jest.fn()
          .mockResolvedValueOnce([{ booked_count: 3 }])
          .mockResolvedValueOnce([{ booked_count: 0 }])
          .mockResolvedValueOnce([{ occupied_count: 5 }])
          .mockResolvedValueOnce([{ occupied_count: 8 }]),
      };
      (getSequelize as jest.Mock).mockReturnValue(mockSequelize);

      // Mock Room.count: for each room type, total first then OOO
      (Room.count as jest.Mock)
        .mockResolvedValueOnce(10)  // total rooms for DLX
        .mockResolvedValueOnce(1)   // OOO for DLX
        .mockResolvedValueOnce(20)  // total rooms for STD
        .mockResolvedValueOnce(0);  // OOO for STD

      const result = await service.getRoomTypeAvailability({
        property_id: 'prop-1',
        check_in_date: '2024-01-15',
        check_out_date: '2024-01-20',
      });

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(expect.objectContaining({
        room_type_id: 'rt-1',
        room_type_name: 'Deluxe',
        room_type_code: 'DLX',
        total_rooms: 10,
        base_rate: 5000,
      }));
      expect(result[1]).toEqual(expect.objectContaining({
        room_type_id: 'rt-2',
        room_type_name: 'Standard',
        room_type_code: 'STD',
        total_rooms: 20,
        base_rate: 3000,
      }));
    });

    it('should calculate available rooms correctly', async () => {
      const mockRoomTypes = [
        { id: 'rt-1', name: 'Deluxe', code: 'DLX', base_rate: 5000 },
      ];
      (RoomType.findAll as jest.Mock).mockResolvedValue(mockRoomTypes);
      const mockSequelize = {
        query: jest.fn()
          .mockResolvedValueOnce([{ booked_count: 3 }])
          .mockResolvedValueOnce([{ occupied_count: 4 }]),
      };

      (Room.count as jest.Mock)
        .mockResolvedValueOnce(10)  // total
        .mockResolvedValueOnce(2);  // OOO
      (getSequelize as jest.Mock).mockReturnValue(mockSequelize);

      const result = await service.getRoomTypeAvailability({
        property_id: 'prop-1',
        check_in_date: '2024-01-15',
        check_out_date: '2024-01-20',
      });

      // available = 10 - 3 - 4 - 2 = 1
      expect(result[0].available_rooms).toBe(1);
      expect(result[0].is_available).toBe(true);
    });

    it('should mark as unavailable when no rooms available', async () => {
      const mockRoomTypes = [
        { id: 'rt-1', name: 'Deluxe', code: 'DLX', base_rate: 5000 },
      ];
      (RoomType.findAll as jest.Mock).mockResolvedValue(mockRoomTypes);
      const mockSequelize = {
        query: jest.fn()
          .mockResolvedValueOnce([{ booked_count: 3 }])
          .mockResolvedValueOnce([{ occupied_count: 3 }]),
      };

      (Room.count as jest.Mock)
        .mockResolvedValueOnce(5)  // total
        .mockResolvedValueOnce(0);  // OOO
      (getSequelize as jest.Mock).mockReturnValue(mockSequelize);

      const result = await service.getRoomTypeAvailability({
        property_id: 'prop-1',
        check_in_date: '2024-01-15',
        check_out_date: '2024-01-20',
      });

      // available = 5 - 3 - 3 - 0 = -1, Math.max(0, -1) = 0
      expect(result[0].available_rooms).toBe(0);
      expect(result[0].is_available).toBe(false);
    });
  });

  describe('getRoomAvailabilityForDates', () => {
    it('should return room availability for date range', async () => {
      const mockRooms = [
        {
          id: 'room-1',
          number: '101',
          status: 'VACANT_CLEAN',
          roomType: { id: 'rt-1', name: 'Deluxe', code: 'DLX' },
        },
        {
          id: 'room-2',
          number: '102',
          status: 'OCCUPIED',
          roomType: { id: 'rt-1', name: 'Deluxe', code: 'DLX' },
        },
      ];
      (Room.findAll as jest.Mock).mockResolvedValue(mockRooms);

      const mockQuery = jest.fn()
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ room_id: 'room-2', check_in_date: '2024-01-10', check_out_date: '2024-01-20' }]);
      const mockSequelize = { query: mockQuery };
      (getSequelize as jest.Mock).mockReturnValue(mockSequelize);

      const result = await service.getRoomAvailabilityForDates('prop-1', '2024-01-15', '2024-01-20');

      expect(result).toHaveLength(2);
      expect(result[0].is_available).toBe(true);
      expect(result[0].is_occupied).toBe(false);
      expect(result[1].is_occupied).toBe(true);
      expect(result[1].is_available).toBe(false);
    });

    it('should mark out of order rooms as unavailable', async () => {
      const mockRooms = [
        {
          id: 'room-1',
          number: '101',
          status: 'OUT_OF_ORDER',
          roomType: { id: 'rt-1', name: 'Deluxe', code: 'DLX' },
        },
      ];
      (Room.findAll as jest.Mock).mockResolvedValue(mockRooms);

      const mockSequelize = {
        query: jest.fn()
          .mockResolvedValueOnce([])
          .mockResolvedValueOnce([]),
      };
      (getSequelize as jest.Mock).mockReturnValue(mockSequelize);

      const result = await service.getRoomAvailabilityForDates('prop-1', '2024-01-15', '2024-01-20');

      expect(result[0].is_available).toBe(false);
    });
  });

  describe('getOccupancyData', () => {
    it('should return occupancy data for a date', async () => {
      (Room.count as jest.Mock)
        .mockResolvedValueOnce(50)   // total
        .mockResolvedValueOnce(3);   // OOO

      (Stay.count as jest.Mock).mockResolvedValue(30);

      const result = await service.getOccupancyData('prop-1', '2024-01-15');

      expect(result).toEqual({
        date: '2024-01-15',
        total_rooms: 50,
        occupied_rooms: 30,
        available_rooms: 17,
        out_of_order_rooms: 3,
        occupancy_rate: 60,
      });
    });

    it('should use current date when no date provided', async () => {
      (Room.count as jest.Mock)
        .mockResolvedValueOnce(50)
        .mockResolvedValueOnce(0);
      (Stay.count as jest.Mock).mockResolvedValue(25);

      const result = await service.getOccupancyData('prop-1');

      expect(result.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(result.occupancy_rate).toBe(50);
    });

    it('should handle zero rooms', async () => {
      (Room.count as jest.Mock)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);
      (Stay.count as jest.Mock).mockResolvedValue(0);

      const result = await service.getOccupancyData('prop-1', '2024-01-15');

      expect(result.total_rooms).toBe(0);
      expect(result.occupancy_rate).toBe(0);
      expect(result.available_rooms).toBe(0);
    });
  });

  describe('singleton export', () => {
    it('should export a singleton instance', () => {
      expect(availabilityService).toBeInstanceOf(AvailabilityService);
    });
  });
});
