// Mock all dependencies before importing
jest.mock('../../config/database', () => ({
  getSequelize: jest.fn(),
}));

jest.mock('../../models/reservation.model', () => ({
  Reservation: {
    findAll: jest.fn(),
  },
}));

jest.mock('../../models/stay.model', () => ({
  Stay: {
    findAll: jest.fn(),
    count: jest.fn(),
  },
}));

jest.mock('../../models/room.model', () => ({
  Room: {
    findAll: jest.fn(),
    count: jest.fn(),
  },
}));

jest.mock('../../models/payment.model', () => ({
  Payment: {
    findAll: jest.fn(),
    sum: jest.fn(),
  },
}));

jest.mock('../../models/invoice.model', () => ({
  Invoice: {
    findAll: jest.fn(),
  },
}));

jest.mock('../../models/guest.model', () => ({
  Guest: {},
}));

jest.mock('../../models/folio-item.model', () => ({
  FolioItem: {
    sum: jest.fn(),
  },
}));

jest.mock('../../models/folio.model', () => ({
  Folio: {
    findAll: jest.fn(),
  },
}));

import { ReportService, reportService } from '../report.service';
import { Reservation } from '../../models/reservation.model';
import { Stay } from '../../models/stay.model';
import { Room } from '../../models/room.model';
import { Payment } from '../../models/payment.model';
import { FolioItem } from '../../models/folio-item.model';
import { Folio } from '../../models/folio.model';

describe('ReportService', () => {
  let service: ReportService;

  beforeEach(() => {
    service = new ReportService();
    jest.clearAllMocks();
  });

  describe('getArrivals', () => {
    it('should return arrivals for a date', async () => {
      const mockArrivals = [{ id: 'res-1', status: 'CONFIRMED' }];
      (Reservation.findAll as jest.Mock).mockResolvedValue(mockArrivals);

      const result = await service.getArrivals('prop-1', '2024-01-15');

      expect(result).toEqual(mockArrivals);
      expect(Reservation.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            property_id: 'prop-1',
            check_in_date: '2024-01-15',
          }),
        })
      );
    });
  });

  describe('getDepartures', () => {
    it('should return departures for a date', async () => {
      const mockDepartures = [{ id: 'stay-1', guest: { first_name: 'John' } }];
      (Stay.findAll as jest.Mock).mockResolvedValue(mockDepartures);

      const result = await service.getDepartures('prop-1', '2024-01-15');

      expect(result).toEqual(mockDepartures);
      expect(Stay.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            property_id: 'prop-1',
            check_out_date: '2024-01-15',
            status: 'ACTIVE',
          }),
        })
      );
    });
  });

  describe('getInHouseGuests', () => {
    it('should return in-house guests', async () => {
      const mockGuests = [{ id: 'stay-1', guest: { first_name: 'John' } }];
      (Stay.findAll as jest.Mock).mockResolvedValue(mockGuests);

      const result = await service.getInHouseGuests('prop-1');

      expect(result).toEqual(mockGuests);
      expect(Stay.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { property_id: 'prop-1', status: 'ACTIVE' },
        })
      );
    });
  });

  describe('getRoomStatus', () => {
    it('should return room status summary', async () => {
      const mockRooms = [
        { status: 'VACANT_CLEAN', dataValues: { count: 10 } },
        { status: 'OCCUPIED', dataValues: { count: 5 } },
        { status: 'DIRTY', dataValues: { count: 3 } },
      ];
      (Room.findAll as jest.Mock).mockResolvedValue(mockRooms);

      const result = await service.getRoomStatus('prop-1');

      expect(result.summary).toEqual({
        VACANT_CLEAN: 10,
        OCCUPIED: 5,
        DIRTY: 3,
      });
      expect(result.total).toBe(18);
    });

    it('should handle zero rooms', async () => {
      (Room.findAll as jest.Mock).mockResolvedValue([]);

      const result = await service.getRoomStatus('prop-1');

      expect(result.summary).toEqual({});
      expect(result.total).toBe(0);
    });
  });

  describe('getDailyRevenue', () => {
    it('should return daily revenue data', async () => {
      (FolioItem.sum as jest.Mock).mockResolvedValueOnce(1000).mockResolvedValueOnce(200);
      (Payment.sum as jest.Mock).mockResolvedValueOnce(1200).mockResolvedValueOnce(100);

      const result = await service.getDailyRevenue('prop-1', '2024-01-15');

      expect(result).toEqual({
        date: '2024-01-15',
        room_revenue: 1000,
        pos_revenue: 200,
        total_revenue: 1200,
        total_payments: 1200,
        total_refunds: 100,
      });
    });

    it('should handle null sums', async () => {
      (FolioItem.sum as jest.Mock).mockResolvedValue(null);
      (Payment.sum as jest.Mock).mockResolvedValue(null);

      const result = await service.getDailyRevenue('prop-1', '2024-01-15');

      expect(result.room_revenue).toBe(0);
      expect(result.pos_revenue).toBe(0);
      expect(result.total_revenue).toBe(0);
    });
  });

  describe('getOccupancyReport', () => {
    it('should return occupancy data for date range', async () => {
      (Room.count as jest.Mock).mockResolvedValue(50);
      (Stay.count as jest.Mock).mockResolvedValue(30);

      const result = await service.getOccupancyReport('prop-1', '2024-01-01', '2024-01-03');

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        date: '2024-01-01',
        total_rooms: 50,
        occupied: 30,
        available: 20,
        occupancy_rate: 60,
      });
    });

    it('should handle zero total rooms', async () => {
      (Room.count as jest.Mock).mockResolvedValue(0);
      (Stay.count as jest.Mock).mockResolvedValue(0);

      const result = await service.getOccupancyReport('prop-1', '2024-01-01', '2024-01-01');

      expect(result).toHaveLength(1);
      expect(result[0].occupancy_rate).toBe(0);
    });
  });

  describe('getPaymentsReport', () => {
    it('should return payments report grouped by method', async () => {
      const mockPayments = [
        { method: 'CARD', total: 5000, count: 25 },
        { method: 'CASH', total: 2000, count: 10 },
      ];
      (Payment.findAll as jest.Mock).mockResolvedValue(mockPayments);

      const result = await service.getPaymentsReport('prop-1', '2024-01-01', '2024-01-31');

      expect(result).toEqual(mockPayments);
    });
  });

  describe('getOutstandingReport', () => {
    it('should return outstanding balances', async () => {
      const mockFolios = [
        { id: 'folio-1', folio_number: 'F001', balance: 150 },
      ];
      (Folio.findAll as jest.Mock).mockResolvedValue(mockFolios);

      const result = await service.getOutstandingReport('prop-1');

      expect(result).toEqual(mockFolios);
      expect(Folio.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { property_id: 'prop-1', status: 'OPEN' },
        })
      );
    });
  });

  describe('singleton export', () => {
    it('should export a singleton instance', () => {
      expect(reportService).toBeInstanceOf(ReportService);
    });
  });
});
