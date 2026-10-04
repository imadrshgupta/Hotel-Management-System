// Mock all dependencies before importing
jest.mock('../../config/database', () => ({
  getSequelize: jest.fn(),
}));

jest.mock('../../config/redis', () => ({
  acquireLock: jest.fn(),
  releaseLock: jest.fn(),
}));

jest.mock('../../config/websocket', () => ({
  broadcastToProperty: jest.fn(),
}));

jest.mock('../../models/reservation.model', () => ({
  Reservation: {
    findByPk: jest.fn(),
    findAndCountAll: jest.fn(),
    create: jest.fn(),
    findAll: jest.fn(),
  },
}));

jest.mock('../../models/reservation-room.model', () => ({
  ReservationRoom: {
    create: jest.fn(),
    update: jest.fn(),
  },
}));

jest.mock('../../models/reservation-guest.model', () => ({
  ReservationGuest: {
    create: jest.fn(),
  },
}));

jest.mock('../../models/room.model', () => ({
  Room: {
    findByPk: jest.fn(),
  },
}));

jest.mock('../../models/guest.model', () => ({
  Guest: {
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock('../../models/room-type.model', () => ({
  RoomType: {
    findByPk: jest.fn(),
  },
}));

jest.mock('../../models/audit-log.model', () => ({
  AuditLog: {
    create: jest.fn(),
  },
}));

import { ReservationService } from '../reservation.service';
import { Reservation } from '../../models/reservation.model';
import { ReservationRoom } from '../../models/reservation-room.model';
import { ReservationGuest } from '../../models/reservation-guest.model';
import { Guest } from '../../models/guest.model';
import { RoomType } from '../../models/room-type.model';
import { getSequelize } from '../../config/database';
import { acquireLock, releaseLock } from '../../config/redis';
import { broadcastToProperty } from '../../config/websocket';
import { AuditLog } from '../../models/audit-log.model';
import { BusinessRuleError, ConflictError, NotFoundError } from '../../errors/app-error';

describe('ReservationService', () => {
  let service: ReservationService;

  beforeEach(() => {
    service = new ReservationService();
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should return a reservation with includes', async () => {
      const mockReservation = { id: 'res-1', status: 'CONFIRMED' };
      (Reservation.findByPk as jest.Mock).mockResolvedValue(mockReservation);

      const result = await service.findById('res-1');

      expect(result).toEqual(mockReservation);
      expect(Reservation.findByPk).toHaveBeenCalledWith('res-1', {
        include: expect.any(Array),
      });
    });

    it('should throw NotFoundError when reservation not found', async () => {
      (Reservation.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow(NotFoundError);
    });
  });

  describe('findAll', () => {
    it('should return paginated reservations', async () => {
      const mockResult = {
        rows: [{ id: 'res-1' }],
        count: 1,
      };
      (Reservation.findAndCountAll as jest.Mock).mockResolvedValue(mockResult);

      const result = await service.findAll('prop-1', { status: 'CONFIRMED' }, 1, 20);

      expect(result.reservations).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(Reservation.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ property_id: 'prop-1', status: 'CONFIRMED' }),
          limit: 20,
          offset: 0,
        })
      );
    });

    it('should apply confirmation_number filter', async () => {
      (Reservation.findAndCountAll as jest.Mock).mockResolvedValue({ rows: [], count: 0 });

      await service.findAll('prop-1', { confirmation_number: 'RES' }, 1, 20);

      expect(Reservation.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            confirmation_number: expect.any(Object),
          }),
        })
      );
    });
  });

  describe('confirm', () => {
    it('should confirm a reservation', async () => {
      const mockReservation = {
        id: 'res-1',
        status: 'INQUIRY',
        property_id: 'prop-1',
        confirmation_number: 'RES2401ABCDEF',
        update: jest.fn(),
      };
      (Reservation.findByPk as jest.Mock).mockResolvedValue(mockReservation);
      (Reservation.findAndCountAll as jest.Mock).mockResolvedValue({ rows: [], count: 0 });

      const result = await service.confirm('res-1', 'user-1');

      expect(mockReservation.update).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'CONFIRMED' })
      );
      expect(broadcastToProperty).toHaveBeenCalled();
    });

    it('should throw error for invalid status transition', async () => {
      const mockReservation = {
        id: 'res-1',
        status: 'CHECKED_OUT',
        property_id: 'prop-1',
      };
      (Reservation.findByPk as jest.Mock).mockResolvedValue(mockReservation);

      await expect(service.confirm('res-1', 'user-1')).rejects.toThrow(BusinessRuleError);
    });
  });

  describe('cancel', () => {
    it('should cancel a reservation', async () => {
      const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };
      const mockSequelize = { transaction: jest.fn().mockResolvedValue(mockTransaction) };
      (getSequelize as jest.Mock).mockReturnValue(mockSequelize);

      const mockReservation = {
        id: 'res-1',
        status: 'CONFIRMED',
        property_id: 'prop-1',
        confirmation_number: 'RES2401ABCDEF',
        update: jest.fn(),
      };
      (Reservation.findByPk as jest.Mock).mockResolvedValue(mockReservation);
      (ReservationRoom.update as jest.Mock).mockResolvedValue([1]);

      const result = await service.cancel('res-1', 'user-1', 'Changed plans');

      expect(mockReservation.update).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'CANCELLED' }),
        { transaction: mockTransaction }
      );
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(broadcastToProperty).toHaveBeenCalled();
    });

    it('should throw error for invalid status transition', async () => {
      const mockReservation = {
        id: 'res-1',
        status: 'CHECKED_OUT',
      };
      (Reservation.findByPk as jest.Mock).mockResolvedValue(mockReservation);

      await expect(service.cancel('res-1', 'user-1')).rejects.toThrow(BusinessRuleError);
    });
  });

  describe('noShow', () => {
    it('should mark reservation as no show', async () => {
      const mockReservation = {
        id: 'res-1',
        status: 'CONFIRMED',
        property_id: 'prop-1',
        confirmation_number: 'RES2401ABCDEF',
        update: jest.fn(),
      };
      (Reservation.findByPk as jest.Mock).mockResolvedValue(mockReservation);
      (Reservation.findAndCountAll as jest.Mock).mockResolvedValue({ rows: [], count: 0 });

      const result = await service.noShow('res-1', 'user-1');

      expect(mockReservation.update).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'NO_SHOW' })
      );
      expect(broadcastToProperty).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update a reservation', async () => {
      const mockReservation = {
        id: 'res-1',
        status: 'CONFIRMED',
        property_id: 'prop-1',
        confirmation_number: 'RES2401ABC',
        update: jest.fn(),
      };
      (Reservation.findByPk as jest.Mock)
        .mockResolvedValueOnce(mockReservation)
        .mockResolvedValueOnce({ ...mockReservation, adults: 3 });
      (Reservation.findAndCountAll as jest.Mock).mockResolvedValue({ rows: [], count: 0 });

      const result = await service.update('res-1', { adults: 3 }, 'user-1');

      expect(mockReservation.update).toHaveBeenCalled();
    });

    it('should throw error for non-updatable status', async () => {
      const mockReservation = {
        id: 'res-1',
        status: 'CHECKED_IN',
        property_id: 'prop-1',
      };
      (Reservation.findByPk as jest.Mock).mockResolvedValue(mockReservation);

      await expect(service.update('res-1', { adults: 3 }, 'user-1')).rejects.toThrow(
        BusinessRuleError
      );
    });

    it('should allow update for INQUIRY status', async () => {
      const mockReservation = {
        id: 'res-1',
        status: 'INQUIRY',
        property_id: 'prop-1',
        update: jest.fn(),
      };
      (Reservation.findByPk as jest.Mock)
        .mockResolvedValueOnce(mockReservation)
        .mockResolvedValueOnce({ ...mockReservation });

      await service.update('res-1', { adults: 2 }, 'user-1');

      expect(mockReservation.update).toHaveBeenCalled();
    });

    it('should allow update for TENTATIVE status', async () => {
      const mockReservation = {
        id: 'res-1',
        status: 'TENTATIVE',
        property_id: 'prop-1',
        update: jest.fn(),
      };
      (Reservation.findByPk as jest.Mock)
        .mockResolvedValueOnce(mockReservation)
        .mockResolvedValueOnce({ ...mockReservation });

      await service.update('res-1', { adults: 2 }, 'user-1');

      expect(mockReservation.update).toHaveBeenCalled();
    });
  });
});
